import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';

@Component({ templateUrl: 'login.component.html', standalone: false })
export class LoginComponent implements OnInit {
    form!: FormGroup;
    loading = false;
    submitted = false;
    errorMessage = '';

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.form = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }

    // Convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onSubmit() {
    this.submitted = true;
    this.alertService.clear();

    if (this.form.invalid) {
        return;
    }

    this.loading = true;

    // Timeout fallback in case Render is slow
    const timeout = setTimeout(() => {
        this.loading = false;
        this.alertService.error('Server is taking too long to respond. Please try again.');
    }, 15000);

    this.accountService.login(this.f['email'].value, this.f['password'].value)
        .pipe(first())
        .subscribe({
            next: () => {
                clearTimeout(timeout);
                const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
                this.router.navigateByUrl(returnUrl);
            },
           error: error => {
            clearTimeout(timeout);
            this.errorMessage = error?.toString().toLowerCase().includes('verify')
        ? 'Your email is not verified. Please check your email for verification instructions.'
        : error;
             this.loading = false;
            }
        });
    }
}
