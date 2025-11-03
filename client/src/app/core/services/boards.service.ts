import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Board, CreateBoardDto } from '../models/board.model';

@Injectable({
  providedIn: 'root',
})
export class BoardsService {
  private readonly API_URL = 'http://localhost:3000/boards';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Board[]> {
    return this.http.get<Board[]>(this.API_URL);
  }

  getById(id: string): Observable<Board> {
    return this.http.get<Board>(`${this.API_URL}/${id}`);
  }

  create(board: CreateBoardDto): Observable<Board> {
    return this.http.post<Board>(this.API_URL, board);
  }

  update(id: string, board: Partial<CreateBoardDto>): Observable<Board> {
    return this.http.patch<Board>(`${this.API_URL}/${id}`, board);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }
}

