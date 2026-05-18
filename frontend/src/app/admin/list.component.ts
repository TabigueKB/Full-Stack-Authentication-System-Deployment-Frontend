import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { first } from 'rxjs/operators';
import { AccountService } from '@app/_services';

@Component({ templateUrl: 'list.component.html', standalone: false })
export class ListComponent implements OnInit {
    accounts: any[] = [];
    error = '';

    constructor(
        private accountService: AccountService,
        private cd: ChangeDetectorRef
    ) { }

    ngOnInit() {
        setTimeout(() => {
            this.accountService.getAll()
                .pipe(first())
                .subscribe({
                    next: accounts => {
                        this.accounts = [...accounts];
                        this.cd.detectChanges();
                    },
                    error: err => {
                        this.error = err?.message || 'Failed to load accounts';
                        this.cd.detectChanges();
                    }
                });
        }, 3000);
    }

    deleteAccount(id: number) {
        const account = this.accounts.find(x => x.id === id);
        if (!account) return;
        if (confirm('Are you sure you want to delete this account?')) {
            account.isDeleting = true;
            this.accountService.delete(id)
                .pipe(first())
                .subscribe(() => {
                    this.accounts = this.accounts.filter(x => x.id !== id);
                    this.cd.detectChanges();
                });
        }
    }
}