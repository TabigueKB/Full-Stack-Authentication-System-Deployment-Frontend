import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';

@Component({ templateUrl: 'register.component.html', standalone: false })
export class RegisterComponent implements OnInit {
    form!: FormGroup;
    loading = false;
    submitted = false;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.form = this.formBuilder.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required],
            acceptTerms: [false, Validators.requiredTrue]
        }, {
            validators: this.mustMatch('password', 'confirmPassword')
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

    // Set a 15 second timeout in case email sending is slow
    const timeout = setTimeout(() => {
        this.alertService.success('Registration successful, please check your email for verification instructions', { keepAfterRouteChange: true });
        this.router.navigate(['../login'], { relativeTo: this.route });
    }, 15000);

    this.accountService.register(this.form.value)
        .pipe(first())
        .subscribe({
            next: () => {
                clearTimeout(timeout);
                this.alertService.success('Registration successful, please check your email for verification instructions', { keepAfterRouteChange: true });
                this.router.navigate(['../login'], { relativeTo: this.route });
            },
            error: error => {
                clearTimeout(timeout);
                this.alertService.error(error);
                this.loading = false;
            }
        });
    }

    // Custom validator to check that two fields match
    mustMatch(controlName: string, matchingControlName: string) {
        return (group: AbstractControl) => {
            const control = group.get(controlName);
            const matchingControl = group.get(matchingControlName);

            if (!control || !matchingControl) return null;

            if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
                return null;
            }

            if (control.value !== matchingControl.value) {
                matchingControl.setErrors({ mustMatch: true });
            } else {
                matchingControl.setErrors(null);
            }
            return null;
        };
    }
}
