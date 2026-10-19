import { randomUUID } from 'node:crypto';

export interface Address {
  street: string;
  houseNumber: string;
  city: string;
  state: string;
  countryCode: string;
  postalCode: string;
}

export interface User {
  firstName: string;
  lastName: string;
  dob: string;
  phone: string;
  email: string;
  password: string;
  address: Address;
}

export const defaultAddress: Address = {
  street: 'Autarboulevard',
  houseNumber: '5',
  city: 'Stroe',
  state: 'Groningen',
  countryCode: 'NL',
  postalCode: '1011AB',
};

export function uniqueEmail(prefix = 'sis2'): string {
  return `${prefix}.${Date.now()}.${randomUUID().slice(0, 8)}@example.com`;
}

export function createUser(overrides: Partial<User> = {}): User {
  return {
    firstName: 'Aida',
    lastName: 'Testova',
    dob: '1998-04-12',
    phone: '77011234567',
    email: uniqueEmail(),
    password: `Sis2!${randomUUID().slice(0, 8)}Pw`,
    address: { ...defaultAddress },
    ...overrides,
  };
}
