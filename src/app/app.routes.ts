import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { Home } from './layout/home/home';
import { Contact } from './layout/contact/contact';
import { Portfolio } from './layout/portfolio/portfolio';
import { Resume } from './layout/resume/resume';
import { Dashboard } from './dashboard/dashboard';

export const routes: Routes = [
    {
        path: '',
        component: Layout,
        children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: Home },
            { path: 'contact', component: Contact },
            { path: 'portfolio', component: Portfolio },
            { path: 'resume', component: Resume },
            { path: 'dashboard', component: Dashboard }
        ]
    },
    { path: '**', redirectTo: 'home' }
];
