import prisma from '@/utils/prisma';
import redisClient from '@/utils/redis';
import { 
  hashPassword, 
  comparePassword, 
  generateAccessToken, 
  generateRefreshToken,
  verifyRefreshToken,
  generateSessionId,
  generateDeviceFingerprint
} from '@/utils/auth';
import { 
  LoginDTO, 
  RegisterDTO, 
  AuthResponse, 
  JWTPayload,
  AuthenticationError,
  ConflictError,
  NotFoundError,
  ValidationError
} from '@/types';

export class AuthService {
  // User registration
  async register(registerData: RegisterDTO): Promise<AuthResponse> {
    const { email, password, phone, role = 'CUSTOMER', firstName, lastName } = registerData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with profile
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        phone,
        role,
        status: 'PENDING',
        profile: {
          create: {
            firstName,
            lastName,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // Generate tokens
    const tokenPayload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Create session
    const sessionId = generateSessionId();
    await redisClient.setSession(sessionId, {
      userId: user.id,
      email: user.email,
      role: user.role,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'USER',
        entityId: user.id,
        action: 'USER_REGISTERED',
        actorId: user.id,
        actorType: 'USER',
        changes: {
          email: user.email,
          role: user.role,
        },
        metadata: {
          source: 'registration',
        },
      },
    });

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token: accessToken,
      refreshToken,
    };
  }

  // User login
  async login(loginData: LoginDTO, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {
    const { email, password } = loginData;

    // Find user with profile
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
      },
    });

    if (!user) {
      // Track failed login attempt
      if (ipAddress) {
        await redisClient.set(`failed_logins:${ipAddress}`, '1', 3600); // 1 hour
      }
      throw new AuthenticationError('Invalid email or password');
    }

    // Check if user is active
    if (user.status === 'SUSPENDED') {
      throw new AuthenticationError('Account is suspended');
    }

    if (user.status === 'INACTIVE') {
      throw new AuthenticationError('Account is inactive');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      // Track failed login attempt
      if (ipAddress) {
        await redisClient.set(`failed_logins:${ipAddress}`, '1', 3600);
      }
      throw new AuthenticationError('Invalid email or password');
    }

    // Generate tokens
    const tokenPayload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Create session
    const sessionId = generateSessionId();
    const deviceFingerprint = generateDeviceFingerprint(userAgent || '', ipAddress || '');
    
    await redisClient.setSession(sessionId, {
      userId: user.id,
      email: user.email,
      role: user.role,
      deviceFingerprint,
      ipAddress,
      userAgent,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    });

    // Update user last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        updatedAt: new Date(),
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'USER',
        entityId: user.id,
        action: 'USER_LOGIN',
        actorId: user.id,
        actorType: 'USER',
        metadata: {
          source: 'login',
          deviceFingerprint,
        },
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    });

    // Clear failed login attempts
    if (ipAddress) {
      await redisClient.del(`failed_logins:${ipAddress}`);
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token: accessToken,
      refreshToken,
    };
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    try {
      // Verify refresh token
      const payload = verifyRefreshToken(refreshToken);

      // Check if user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user || user.status !== 'ACTIVE') {
        throw new AuthenticationError('User not found or inactive');
      }

      // Generate new tokens
      const newTokenPayload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const newAccessToken = generateAccessToken(newTokenPayload);
      const newRefreshToken = generateRefreshToken(newTokenPayload);

      return {
        token: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }
  }

  // Logout user
  async logout(userId: string, token: string): Promise<void> {
    // Add token to blacklist
    await redisClient.set(`blacklist:${token}`, 'true', 86400); // 24 hours

    // Remove session
    await redisClient.deleteSession(userId);

    // Create audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'USER',
        entityId: userId,
        action: 'USER_LOGOUT',
        actorId: userId,
        actorType: 'USER',
        metadata: {
          source: 'logout',
        },
      },
    });
  }

  // Get user profile
  async getUserProfile(userId: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Update user profile
  async updateUserProfile(userId: string, updateData: any): Promise<any> {
    const { firstName, lastName, dateOfBirth, nationality, occupation, address } = updateData;

    // Prepare profile update data with proper type handling
    const profileUpdateData: any = {};
    
    if (firstName !== undefined) profileUpdateData.firstName = firstName;
    if (lastName !== undefined) profileUpdateData.lastName = lastName;
    if (dateOfBirth !== undefined) profileUpdateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : undefined;
    if (nationality !== undefined) profileUpdateData.nationality = nationality;
    if (occupation !== undefined) profileUpdateData.occupation = occupation;
    if (address?.street !== undefined) profileUpdateData.street = address.street;
    if (address?.city !== undefined) profileUpdateData.city = address.city;
    if (address?.state !== undefined) profileUpdateData.state = address.state;
    if (address?.country !== undefined) profileUpdateData.country = address.country;
    if (address?.postalCode !== undefined) profileUpdateData.postalCode = address.postalCode;

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(updateData.phone !== undefined && { phone: updateData.phone }),
        profile: {
          update: profileUpdateData,
        },
      },
      include: {
        profile: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'USER',
        entityId: userId,
        action: 'PROFILE_UPDATED',
        actorId: userId,
        actorType: 'USER',
        changes: updateData,
        metadata: {
          source: 'profile_update',
        },
      },
    });

    return updatedUser;
  }

  // Change password
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'USER',
        entityId: userId,
        action: 'PASSWORD_CHANGED',
        actorId: userId,
        actorType: 'USER',
        metadata: {
          source: 'password_change',
        },
      },
    });
  }

  // Verify email (for future email verification feature)
  async verifyEmail(userId: string, verificationToken: string): Promise<void> {
    // In a real implementation, you would verify the token
    // For now, we'll just update the user status
    await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'ACTIVE',
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'USER',
        entityId: userId,
        action: 'EMAIL_VERIFIED',
        actorId: userId,
        actorType: 'USER',
        metadata: {
          source: 'email_verification',
        },
      },
    });
  }

  // Get user sessions
  async getUserSessions(userId: string): Promise<any[]> {
    // In a real implementation, you would get all sessions for the user
    // For now, we'll return the current session if it exists
    const session = await redisClient.getSession(userId);
    return session ? [session] : [];
  }

  // Revoke all sessions (logout from all devices)
  async revokeAllSessions(userId: string): Promise<void> {
    // Remove all sessions for the user
    await redisClient.deleteSession(userId);

    // In a real implementation, you would also blacklist all active tokens
    // This would require storing active tokens or implementing a token versioning system

    // Create audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'USER',
        entityId: userId,
        action: 'ALL_SESSIONS_REVOKED',
        actorId: userId,
        actorType: 'USER',
        metadata: {
          source: 'security_action',
        },
      },
    });
  }
}