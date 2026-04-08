import type { CalendarEvent } from '../../models/types.js';
import type { ICalendarEventRepository } from '../interfaces.js';
export declare class MockCalendarEventRepository implements ICalendarEventRepository {
    private events;
    findAll(filters?: {
        userId?: string;
        from?: string;
        to?: string;
    }): Promise<CalendarEvent[]>;
    findById(id: string): Promise<CalendarEvent | null>;
    create(data: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent>;
    update(id: string, data: Partial<CalendarEvent>): Promise<CalendarEvent | null>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=calendar.repository.d.ts.map