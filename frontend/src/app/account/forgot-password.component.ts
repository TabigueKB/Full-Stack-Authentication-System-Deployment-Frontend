import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService } from '@app/_services';

@Component({ templateUrl: 'forgot-password.component.html', standalone: false })
export class ForgotPasswordComponent implements OnInit {
    form!: FormGroup;
    loading = false;
    submitted = false;
    successMessage = '';
    errorMessage = '';

    constructor(
        private formBuilder: FormBuilder,
        private accountService: AccountService
    ) { }

    ngOnInit() {
        this.form = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;
        this.successMessage = '';
        this.errorMessage = '';

        if (this.form.invalid) return;

        this.loading = true;

        const timeout = setTimeout(() => {
            this.loading = false;
            this.successMessage = 'If this email exists, password reset instructions have been sent.';
        }, 15000);

        this.accountService.forgotPassword(this.f['email'].value)
            .pipe(first())
            .subscribe({
                next: () => {
                    clearTimeout(timeout);
                    this.loading = false;
                    this.successMessage = 'Please check your email for password reset instructions.';
                },
                error: error => {
                    clearTimeout(timeout);
                    this.loading = false;
                    this.errorMessage = error;
                }
            });
    }
}