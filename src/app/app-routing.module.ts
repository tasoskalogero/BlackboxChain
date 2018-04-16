import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {SoftwareComponent} from './components/software/software.component';
import {PageNotFoundComponent} from './components/page-not-found.component';
import {DatasetComponent} from './components/dataset/dataset.component';
import {HomeComponent} from './components/home/home.component';
import {ContainerComponent} from './components/container/container.component';
import {ComputationLayoutComponent} from './components/layouts/computation-layout/computation-layout.component';
import {ResultLayoutComponent} from './components/layouts/result-layout/result-layout.component';


const appRoutes: Routes = [
  { path: 'home', component: HomeComponent},
  { path: 'computation', component: ComputationLayoutComponent},
  { path: 'software', component: SoftwareComponent},
  { path: 'dataset', component: DatasetComponent},
  { path: 'container', component: ContainerComponent},
    { path: 'results', component: ResultLayoutComponent},
  { path: '',   redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent },
  ];

@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes
    )
  ],
  exports: [
    RouterModule
  ],
  providers: []
})
export class AppRoutingModule { }
