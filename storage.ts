import { type User, type InsertUser, type Sale, type InsertSale } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllSales(): Promise<Sale[]>;
  createSale(sale: InsertSale): Promise<Sale>;
  deleteSale(id: string): Promise<boolean>;
  getSalesByUser(usuario: string): Promise<Sale[]>;
  getSalesByDateRange(start: Date, end: Date): Promise<Sale[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private sales: Map<string, Sale>;

  constructor() {
    this.users = new Map();
    this.sales = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllSales(): Promise<Sale[]> {
    return Array.from(this.sales.values()).sort((a, b) => 
      new Date(b.data).getTime() - new Date(a.data).getTime()
    );
  }

  async createSale(insertSale: InsertSale): Promise<Sale> {
    const id = randomUUID();
    const sale: Sale = { 
      ...insertSale, 
      id, 
      data: new Date(),
      valor: insertSale.valor.toString()
    };
    this.sales.set(id, sale);
    return sale;
  }

  async deleteSale(id: string): Promise<boolean> {
    return this.sales.delete(id);
  }

  async getSalesByUser(usuario: string): Promise<Sale[]> {
    return Array.from(this.sales.values())
      .filter(sale => sale.usuario === usuario)
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }

  async getSalesByDateRange(start: Date, end: Date): Promise<Sale[]> {
    return Array.from(this.sales.values())
      .filter(sale => {
        const saleDate = new Date(sale.data);
        return saleDate >= start && saleDate <= end;
      })
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }
}

export const storage = new MemStorage();
