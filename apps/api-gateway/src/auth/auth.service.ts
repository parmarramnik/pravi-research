import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, UserRole, JwtPayload, AuthResponse } from '@infrasphere/shared-types';

export const DEMO_USERS: (User & { passwordHash: string })[] = [
  {
    id: 'user-admin-001',
    email: 'admin@infrasphere.local',
    name: 'Chief Infrastructure Officer (Admin)',
    role: UserRole.ADMIN,
    department: 'Municipal Executive Office',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    passwordHash: bcrypt.hashSync('Infrasphere@2026', 10),
  },
  {
    id: 'user-mgr-002',
    email: 'asset.manager@infrasphere.local',
    name: 'Rajesh Sharma (Asset Manager)',
    role: UserRole.ASSET_MANAGER,
    department: 'Asset Planning & Inventory',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    passwordHash: bcrypt.hashSync('Infrasphere@2026', 10),
  },
  {
    id: 'user-insp-003',
    email: 'inspector@infrasphere.local',
    name: 'Pooja Verma (Field Quality Inspector)',
    role: UserRole.INSPECTOR,
    department: 'Quality & Safety Engineering',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    passwordHash: bcrypt.hashSync('Infrasphere@2026', 10),
  },
  {
    id: 'user-maint-004',
    email: 'maintenance@infrasphere.local',
    name: 'Amitabh Sen (Maintenance Manager)',
    role: UserRole.MAINTENANCE_MANAGER,
    department: 'Public Works & Operations',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    passwordHash: bcrypt.hashSync('Infrasphere@2026', 10),
  },
  {
    id: 'user-view-005',
    email: 'viewer@infrasphere.local',
    name: 'Ananya Roy (Audit Observer)',
    role: UserRole.VIEWER,
    department: 'Public Oversight Bureau',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    passwordHash: bcrypt.hashSync('Infrasphere@2026', 10),
  },
];

export class AuthService {
  private jwtSecret: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'infrasphere_jwt_secret_dev_key_2026_super_secure';
  }

  public async login(email: string, password: string): Promise<AuthResponse | null> {
    const user = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user || !user.isActive) return null;

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return null;

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = jwt.sign(payload, this.jwtSecret, { expiresIn: '7d' });

    const { passwordHash: _, ...safeUser } = user;
    return { accessToken, user: safeUser };
  }

  public verifyToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, this.jwtSecret) as JwtPayload;
    } catch (e) {
      return null;
    }
  }

  public getDemoUsers() {
    return DEMO_USERS.map(({ passwordHash: _, ...u }) => u);
  }
}
