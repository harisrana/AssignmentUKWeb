import { CanDeactivateFn } from '@angular/router';

/**
 * Components with dirty-form protection implement this interface.
 * Return true to allow navigation, false/observable to block.
 */
export interface CanComponentDeactivate {
  canDeactivate: () => boolean | Promise<boolean>;
}

/**
 * Prevents navigating away from a component with unsaved changes.
 * The component decides (usually by checking `form.dirty`).
 */
export const unsavedChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (component) => {
  if (!component?.canDeactivate) {
    return true;
  }
  const result = component.canDeactivate();
  if (result === true) {
    return true;
  }
  if (result === false) {
    return confirm('You have unsaved changes. Are you sure you want to leave this page?');
  }
  return result;
};
