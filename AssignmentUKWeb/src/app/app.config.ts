import {
  ApplicationConfig,
  ErrorHandler,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  isDevMode,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withRouterConfig,
} from '@angular/router';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore, provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { loggingInterceptor } from './core/interceptors/logging.interceptor';
import { GlobalErrorHandler } from './core/services/error-handler.service';

import { authFeature } from './features/auth/state/auth.reducer';
import * as authEffects from './features/auth/state/auth.effects';

export function translateLoaderFactory(http: HttpClient): TranslateLoader {
  return new TranslateHttpLoader(http, '/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),

    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
      withRouterConfig({ paramsInheritanceStrategy: 'always' }),
    ),

    provideHttpClient(
      // Order matters: auth → logging → loading → error (outermost catch).
      withInterceptors([authInterceptor, loggingInterceptor, loadingInterceptor, errorInterceptor]),
    ),

    provideAnimationsAsync(),

    // ---- NgRx ----
    provideStore(),
    provideState(authFeature),
    provideEffects(authEffects),
    ...(isDevMode()
      ? [provideStoreDevtools({ maxAge: 25, logOnly: false, connectInZone: false })]
      : []),

    // ---- i18n ----
    provideTranslateService({
      loader: {
        provide: TranslateLoader,
        useFactory: translateLoaderFactory,
        deps: [HttpClient],
      },
      defaultLanguage: environment.defaultLanguage,
      useDefaultLang: true,
    }),

    // ---- Global error handling ----
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
  ],
};
