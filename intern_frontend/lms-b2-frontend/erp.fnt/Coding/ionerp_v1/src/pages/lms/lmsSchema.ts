import { z } from 'zod';
// import { getRoleType } from '../../utils/data';

export const loginFields = [
  // {
  //   name: 'role',
  //   label: 'Application Role Type',
  //   type: 'select',
  //   required: true,
  //   placeholder: 'Select the application role type',
  //   loadOptions: async () => {
  //     const roles = await getRoleType(); // Make sure this returns an array of roles
  //     return roles.map((role: string) => ({
  //       label: role, // Displayed in the dropdown
  //       value: role, // Value to be used in the form
  //     }));
  //   },
  // },
  {
    name: 'username',
    label: 'Username ',
    type: 'text',
    required: true,
    placeholder: 'Enter your username ',
    icon: 'User',
    helpText: 'Enter your login credentials'
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    required: true,
    placeholder: 'Enter your password',
    icon: 'Lock',
    helpText: 'Password must be at least 8 characters'
  }
];

export const loginSchema = z.object({
  // role: z
  //   .string()
  //   .min(1, 'Application Role type is required'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username cannot exceed 50 characters')
    .refine(
      (value) => {
        // Check if it's a valid email or username
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) || /^[a-zA-Z0-9_-]{3,16}$/.test(value);
      },
      { message: 'Invalid username or email format' }
    ),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(50, 'Password cannot exceed 50 characters')
  // .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  // .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  // .regex(/[0-9]/, 'Password must contain at least one number')
  // .regex(/[!@#$%^&*]/, 'Password must contain at least one special character')
});


export const forgotSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
});


export const forgotFields = [
  {
    name: 'email',
    label: 'Email ID: ',
    type: 'text',
    required: true,
    placeholder: 'Enter your Email ID ',
  },
];



export const changeSchema = z.object({
  oldpassword: z
    .string()
    .min(1, 'Old Password is required'),
  newpassword: z
    .string()
    .min(1, 'New Password is required'),
  confirmpassword: z
    .string()
    .min(1, 'Confirm Password is required'),
}).refine((data) => data.newpassword === data.confirmpassword, {
  message: 'Passwords must match',
  path: ['confirmpassword'], // Associate the error with the confirmpassword field
});


export const changeFields = [
  {
    name: 'oldpassword',
    label: 'Old Password: ',
    type: 'password',
    required: true,
    placeholder: 'Enter your old password ',
  },
  {
    name: 'newpassword',
    label: 'New Password: ',
    type: 'password',
    required: true,
    placeholder: 'Enter your new password ',
  },
  {
    name: 'confirmpassword',
    label: 'Confirm Password: ',
    type: 'password',
    required: true,
    placeholder: 'Enter your confirm password ',
  },
];

