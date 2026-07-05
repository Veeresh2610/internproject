import { z } from "zod";
import { LocalStorageHelper } from "../../utils/localStorageHelper";
import { loginData } from "../../pages/login/loginModel";
import { AUTH_COOKIE_KEY } from "../../hooks/useAuth";

export const orgModelSchema = z.object({
  organizationName: z.string().min(1, "Organization is required"),
});

export const orgModelFields = [
  {
    group: "",
    fields: [
      {
        type: "select",
        name: "organizationName",
        label: "Organization",
        loadOptions: async () => {
          const result = await LocalStorageHelper.getObject<loginData>(AUTH_COOKIE_KEY) || null;
          return result && result.org_data ? [{ label: "Select Organization", value: "" }, ...result.org_data.map(org => ({ ...org, value: String(org.value) }))] : Promise.resolve([]);

        },
      },
    ],
  },
];
