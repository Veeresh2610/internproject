import { z } from "zod";

// Define the type for country keys
type Country = "USA" | "Canada"; // Add more countries as needed

// Example schema
const schema = z.object({
  country: z.string().nonempty("Country is required"),
  city: z.string().nonempty("City is required"),
  name: z.string().nonempty("Name is required"),
  age: z.number().min(18, "You must be at least 18 years old"),
  email: z.string().email("Invalid email address"),
});

// Sample city options as a local variable
const cityOptions: Record<Country, { label: string; value: string }[]> = {
  USA: [
    { label: "New York", value: "new_york" },
    { label: "Los Angeles", value: "los_angeles" },
    { label: "Chicago", value: "chicago" },
  ],
  Canada: [
    { label: "Toronto", value: "toronto" },
    { label: "Vancouver", value: "vancouver" },
    { label: "Montreal", value: "montreal" },
  ],
};

// Function to load options dynamically based on selected country
const loadCityOptions = async (country: Country): Promise<{ label: string; value: string }[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(cityOptions[country] || []);
    }, 500);
  });
};

// Function to load options from local storage
const loadLocalStorageOptions = (): { label: string; value: string }[] => {
  const storedData = localStorage.getItem("localCities");
  return storedData ? JSON.parse(storedData) : [];
};

// Mock function to simulate API call
const fetchApiData = async (): Promise<{ label: string; value: string }[]> => {
  // Simulate an API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { label: "San Francisco", value: "san_francisco" },
        { label: "Miami", value: "miami" },
      ]);
    }, 1000);
  });
};

// Function to load options from API
const loadApiOptions = async (): Promise<{ label: string; value: string }[]> => {
  return await fetchApiData();
};

// Define the fields for the form
const fields = [
  {
    group: "Personal Information",
    fields: [
      {
        type: "text",
        name: "name",
        label: "Name",
        required: true,
        placeholder: "Enter your name",
      },
      {
        type: "number",
        name: "age",
        label: "Age",
        required: true,
        placeholder: "Enter your age",
      },
      {
        type: "email",
        name: "email",
        label: "Email",
        required: true,
        placeholder: "Enter your email",
      },
    ],
  },
  {
    group: "Location Information",
    fields: [
      {
        type: "select",
        name: "country",
        label: "Country",
        required: true,
        options: [
          { label: "Select a country", value: "" },
          { label: "USA", value: "USA" },
          { label: "Canada", value: "Canada" },
        ],
      },
      {
        type: "select",
        name: "city",
        label: "City",
        required: true,
        loadOptions: async (country: Country) => {
          // Load options based on selected country
          const apiOptions = await loadApiOptions();
          const localOptions = loadLocalStorageOptions();
          const cityOptionsFromCountry = await loadCityOptions(country);
          return [...cityOptionsFromCountry, ...localOptions, ...apiOptions];
        },
        dependsOn: "country",
      },
    ],
  },
];

// Example: Populate local storage with some city data
localStorage.setItem("localCities", JSON.stringify([
  { label: "Seattle", value: "seattle" },
  { label: "Boston", value: "boston" },
]));

export { schema, fields };
