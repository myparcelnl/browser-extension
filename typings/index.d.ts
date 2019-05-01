/* eslint-disable spaced-comment */
/// <reference types="filesystem" />
/// <reference types="typescript" />

declare namespace MyParcel {
  /**
   * PresetFields yo
   */
  interface PresetFields {
    additional_street: String,
    address_field_1: String,
    box: String,
    cc: String,
    city: String,
    company: String,
    description: String,
    email: String,
    number: String,
    number_suffix: String,
    package_type: String,
    person: String,
    phone: String,
    pickup_number: String,
    pickup_postal: String,
    pickup_street: String,
    postal_code: String,
    street: String,
    weight: String,
  }

  /**
   * Request object.
   */
  interface Request {
    action: String,
  }
}
