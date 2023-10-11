import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";

@Injectable()
export class IsWhitespaceStringConstraint implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value !== "string") {
      throw new BadRequestException("Invalid input. Expected a string.");
    }

    if (value.trim().length === 0) {
      throw new BadRequestException("String contains only whitespace.");
    }

    return value;
  }
}

export function IsBlankNull(validationOptions?: ValidationOptions) {
  return function(object: any, propertyName: string) {
    registerDecorator({
      name: "IsBlankNull",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== "string") {
            return false;
          }
          return value.trim().length !== 0;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} should not be empty`;
        }
      }
    });
  };
}

export function IsNumberStr(validationOptions?: ValidationOptions) {
  return function(object: any, propertyName: string) {
    registerDecorator({
      name: "IsNumberStr",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value === "string") {
            return !isNaN(Number(value));
          } else if (typeof value === "number") {
            return !isNaN(value);
          } else {
            return false;
          }
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} should be a number`;
        }
      }
    });
  };
}
