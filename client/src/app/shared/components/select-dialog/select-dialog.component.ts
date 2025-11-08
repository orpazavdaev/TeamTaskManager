import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-select-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './select-dialog.component.html',
  styleUrl: './select-dialog.component.css',
})
export class SelectDialogComponent implements OnInit {
  @Input() title: string = 'Select option';
  @Input() label: string = 'Select';
  @Input() options: { value: string; label: string; disabled?: boolean }[] = [];
  @Input() confirmText: string = 'Confirm';
  @Input() cancelText: string = 'Cancel';
  @Output() confirm = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      selected: ['', []],
    });
  }

  ngOnInit(): void {
    // Set first non-disabled option as default if available
    const firstAvailableOption = this.options.find((opt) => !opt.disabled);
    if (firstAvailableOption) {
      this.form.patchValue({ selected: firstAvailableOption.value });
    }
  }

  onSubmit(): void {
    if (this.form.valid && this.form.value.selected) {
      this.confirm.emit(this.form.value.selected);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
