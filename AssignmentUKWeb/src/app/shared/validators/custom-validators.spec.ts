import { describe, expect, it } from 'vitest';
import { FormControl, FormGroup } from '@angular/forms';
import { CustomValidators } from './custom-validators';

describe('CustomValidators', () => {
  describe('strongPassword', () => {
    const validator = CustomValidators.strongPassword();

    it('accepts a strong password', () => {
      expect(validator(new FormControl('Aa1!aaaa'))).toBeNull();
    });

    it('rejects a weak password', () => {
      expect(validator(new FormControl('password'))).toEqual({ strongPassword: true });
    });

    it('ignores empty values (leave to required)', () => {
      expect(validator(new FormControl(''))).toBeNull();
    });
  });

  describe('match', () => {
    it('sets mismatch error when controls differ', () => {
      const group = new FormGroup(
        { password: new FormControl('abc'), confirm: new FormControl('xyz') },
        { validators: CustomValidators.match('password', 'confirm') },
      );
      group.updateValueAndValidity();
      expect(group.get('confirm')?.errors).toEqual({ mismatch: true });
    });

    it('clears error when controls match', () => {
      const group = new FormGroup(
        { password: new FormControl('abc'), confirm: new FormControl('abc') },
        { validators: CustomValidators.match('password', 'confirm') },
      );
      group.updateValueAndValidity();
      expect(group.get('confirm')?.errors).toBeNull();
    });
  });

  describe('ukPhone', () => {
    const validator = CustomValidators.ukPhone();
    it('accepts +44 and 0-prefixed numbers', () => {
      expect(validator(new FormControl('+447911123456'))).toBeNull();
      expect(validator(new FormControl('07911123456'))).toBeNull();
    });
    it('rejects invalid numbers', () => {
      expect(validator(new FormControl('12345'))).toEqual({ ukPhone: true });
    });
  });
});
