import { v4 as uuid } from 'uuid';
import type { CalendarEvent } from '../../models/types.js';
import type { ICalendarEventRepository } from '../interfaces.js';
import { mockCalendarEvents } from '../mock-data.js';

export class MockCalendarEventRepository implements ICalendarEventRepository {
  private events: CalendarEvent[] = [...mockCalendarEvents];

  async findAll(filters?: { userId?: string; from?: string; to?: string }): Promise<CalendarEvent[]> {
    let result = [...this.events];
    if (filters?.userId) result = result.filter(e => e.userId === filters.userId);
    if (filters?.from) result = result.filter(e => e.start >= filters.from!);
    if (filters?.to) result = result.filter(e => e.end <= filters.to!);
    return result;
  }

  async findById(id: string): Promise<CalendarEvent | null> {
    return this.events.find(e => e.id === id) ?? null;
  }

  async create(data: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent> {
    const event: CalendarEvent = {
      ...data,
      id: uuid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.events.push(event);
    return event;
  }

  async update(id: string, data: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
    const idx = this.events.findIndex(e => e.id === id);
    if (idx === -1) return null;
    this.events[idx] = { ...this.events[idx], ...data, updatedAt: new Date().toISOString() };
    return this.events[idx];
  }

  async delete(id: string): Promise<boolean> {
    const idx = this.events.findIndex(e => e.id === id);
    if (idx === -1) return false;
    this.events.splice(idx, 1);
    return true;
  }
}
