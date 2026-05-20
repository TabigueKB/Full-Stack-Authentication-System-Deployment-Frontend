import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';

@Component({ templateUrl: 'login.component.html', standalone: false })
export class LoginComponent implements OnInit {
    form!: FormGroup;
    loading = false;
    submitted = false;
    showPassword = false;
    errorMessage = ''; 

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService,
        private cdr: ChangeDetectorRef,
        private ngZone: NgZone
    ) { }

    ngOnInit() {
        this.form = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }

    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;
        this.alertService.clear();

        if (this.form.invalid) return;

        this.loading = true;

        this.accountService.login(this.f['email'].value, this.f['password'].value)
            .pipe(first())
            .subscribe({
                next: () => {
                    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
                    this.router.navigateByUrl(returnUrl);
                },
                error: error => {
                const msg = error?.toString() || '';
                    if (msg.toLowerCase().includes('verify') || msg.toLowerCase().includes('verified')) {
                        this.errorMessage = 'Your email is not verified. Please check your inbox for the verification link.';
                 } else if (msg.toLowerCase().includes('incorrect') || msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('wrong') || msg.toLowerCase().includes('password')) {
                         this.errorMessage = 'Incorrect email or password.';
                 } else {
                         this.errorMessage = msg || 'Login failed. Please try again.';
                 }
                        this.loading = false;
                }
            });
    }
}