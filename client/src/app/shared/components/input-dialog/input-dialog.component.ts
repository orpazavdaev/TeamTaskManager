import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-input-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './input-dialog.component.html',
  styleUrl: './input-dialog.component.css',
})
export class InputDialogComponent implements OnInit {
  @Input() title: string = 'Enter value';
  @Input() label: string = 'Name';
  @Input() placeholder: string = 'Enter value';
  @Input() initialValue: string = '';
  @Input() confirmText: string = 'Confirm';
  @Input() cancelText: string = 'Cancel';
  @Output() confirm = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      value: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    if (this.initialValue) {
      this.form.patchValue({ value: this.initialValue });
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.confirm.emit(this.form.value.value);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}

