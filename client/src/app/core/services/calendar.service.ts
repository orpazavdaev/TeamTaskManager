import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CalendarEvent,
  CreateCalendarEventDto,
  UpdateCalendarEventDto,
} from '../models/calendar-event.model';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private readonly API_URL = `${environment.apiUrl}/calendar`;

  constructor(private http: HttpClient) {}

  create(event: CreateCalendarEventDto): Observable<CalendarEvent> {
    return this.http.post<CalendarEvent>(this.API_URL, event);
  }

  findAll(projectId?: string, startDate?: string, endDate?: string): Observable<CalendarEvent[]> {
    let params = new HttpParams();
    if (projectId) {
      params = params.set('projectId', projectId);
    }
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.http.get<CalendarEvent[]>(this.API_URL, { params });
  }

  getById(id: string): Observable<CalendarEvent> {
    return this.http.get<CalendarEvent>(`${this.API_URL}/${id}`);
  }

  update(id: string, event: UpdateCalendarEventDto): Observable<CalendarEvent> {
    return this.http.patch<CalendarEvent>(`${this.API_URL}/${id}`, event);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
