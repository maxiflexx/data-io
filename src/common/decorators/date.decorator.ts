import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { isBefore } from 'date-fns';

const comparedStartAndEnd = (startDate: Date, endDate: Date) => {
  if (startDate && endDate) {
    return isBefore(startDate, endDate);
  }
};

@ValidatorConstraint({ name: 'IsBeforeDate' })
class IsBeforeDateConstraint implements ValidatorConstraintInterface {
  validate(
    value: Date,
    args?: ValidationArguments,
  ): boolean | Promise<boolean> {
    const [relatedPropertyName] = args.constraints;
    return comparedStartAndEnd(value, args.object[relatedPropertyName]);
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'Date can not before.';
  }
}

export function IsBeforeDate(
  targetProperty: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      constraints: [targetProperty],
      options: validationOptions,
      validator: IsBeforeDateConstraint,
    });
  };
}
