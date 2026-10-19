import { APIRequestContext, expect } from '@playwright/test';
import { API_URL, LEGACY_API } from '../playwright.config';
import { User } from '../data/user.factory';

export class UsersApi {
  constructor(private readonly request: APIRequestContext) {}

  async register(user: User): Promise<void> {
    const response = await this.request.post(`${API_URL}/users/register`, {
      data: {
        first_name: user.firstName,
        last_name: user.lastName,
        dob: user.dob,
        phone: user.phone,
        email: user.email,
        password: user.password,
        ...(LEGACY_API ? legacyAddress(user) : { address: nestedAddress(user) }),
      },
    });
    expect(response.status(), `register ${user.email}: ${await response.text()}`).toBe(201);
  }

  async login(email: string, password: string): Promise<number> {
    const response = await this.request.post(`${API_URL}/users/login`, { data: { email, password } });
    return response.status();
  }
}

function nestedAddress(user: User) {
  return {
    street: user.address.street,
    house_number: user.address.houseNumber,
    city: user.address.city,
    state: user.address.state,
    country: user.address.countryCode,
    postal_code: user.address.postalCode,
  };
}

function legacyAddress(user: User) {
  return {
    address: `${user.address.street} ${user.address.houseNumber}`,
    city: user.address.city,
    state: user.address.state,
    country: user.address.countryCode,
    postcode: user.address.postalCode,
  };
}
