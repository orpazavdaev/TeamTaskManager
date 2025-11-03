import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, CreateTaskDto, MoveTaskDto } from '../models/task.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  private readonly API_URL = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  getByBoard(boardId: string): Observable<Task[]> {
    const params = new HttpParams().set('boardId', boardId);
    return this.http.get<Task[]>(this.API_URL, { params });
  }

  getById(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.API_URL}/${id}`);
  }

  create(task: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(this.API_URL, task);
  }

  update(id: string, task: Partial<CreateTaskDto>): Observable<Task> {
    return this.http.patch<Task>(`${this.API_URL}/${id}`, task);
  }

  move(id: string, moveData: MoveTaskDto): Observable<Task> {
    return this.http.patch<Task>(`${this.API_URL}/${id}/move`, moveData);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }
}
