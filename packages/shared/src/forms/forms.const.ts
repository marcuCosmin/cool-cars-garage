export const inviteUserFormFields = {
  email: {
    label: "Email",
    validator: getEmailError,
    type: "text"
  },
  role: {
    label: "Role",
    type: "select",
    options: ["Admin", "Manager", "Driver"],
    validator: getRequiredError
  },
  dbsUpdate: {
    label: "DBS Update",
    type: "toggle",
    displayCondition: ({ role }) => role === "driver"
  },
  isTaxiDriver: {
    label: "Taxi Driver",
    type: "toggle",
    displayCondition: ({ role }) => role === "driver"
  },
  badgeNumber: {
    label: "Badge Number",
    type: "number",
    validator: getRequiredError,
    displayCondition: ({ role, isTaxiDriver }) =>
      role === "driver" && isTaxiDriver
  },
  badgeExpirationDate: {
    label: "Badge Expiration Date",
    type: "date",
    validator: getRequiredError,
    displayCondition: ({ role, isTaxiDriver }) =>
      role === "driver" && isTaxiDriver
  }
}
