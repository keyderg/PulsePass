package com.example.taller_persisntencia2.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.*;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Documented
@Constraint(validatedBy = MaxUtf8BytesValidator.class)
@Target({METHOD, FIELD, ANNOTATION_TYPE, CONSTRUCTOR, PARAMETER, TYPE_USE})
@Retention(RUNTIME)
public @interface MaxUtf8Bytes {

    int value();

    String message() default "Must not exceed {value} bytes";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}