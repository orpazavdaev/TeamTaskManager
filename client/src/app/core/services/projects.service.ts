import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project, CreateProjectDto, UpdateProjectDto } from '../models/project.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private readonly API_URL = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Project[]> {
    return this.http.get<Project[]>(this.API_URL);
  }

  getMyProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.API_URL}/my-projects`);
  }

  getSharedProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.API_URL}/shared-projects`);
  }

  getById(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.API_URL}/${id}`);
  }

  create(project: CreateProjectDto): Observable<Project> {
    return this.http.post<Project>(this.API_URL, project);
  }

  update(id: string, project: Partial<UpdateProjectDto>): Observable<Project> {
    return this.http.patch<Project>(`${this.API_URL}/${id}`, project);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }

  addBoardToProject(projectId: string, boardId: string): Observable<Project> {
    return this.http.post<Project>(`${this.API_URL}/${projectId}/boards/${boardId}`, {});
  }

  removeBoardFromProject(projectId: string, boardId: string): Observable<Project> {
    return this.http.delete<Project>(`${this.API_URL}/${projectId}/boards/${boardId}`);
  }
}
