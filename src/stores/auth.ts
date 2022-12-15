import { defineStore } from "pinia";
import { reactive, readonly } from "vue";
import { Role, RoleMap } from "@/enums/roles";

import { AxiosInstance } from "@/axios";
import type { User } from "@/typings/globals";

export const useAuth = defineStore("auth", () => {
  const userProfile = reactive<User>({
    username: "Testing admin",
    fullname: "admin bebob",
    // ! should default to a student
    role: Role.CUSTOMER,
    email: "clownystring@gmail.com",
  });

  AxiosInstance.defaults.headers.common = {
    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIwMTk0NTU3NTAiLCJyb2xlIjoxLCJpYXQiOjE2NzEwODc1NDIsImV4cCI6MTY3MTY5MjM0Mn0.Tyxw2tPzcc2WLBLM48mmINSxJspyW3fGKk4sgt_VO2s`,
  };

  sessionStorage.setItem(
    "accessToken",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIwMTk0NTU3NTAiLCJyb2xlIjoxLCJpYXQiOjE2NzEwODc1NDIsImV4cCI6MTY3MTY5MjM0Mn0.Tyxw2tPzcc2WLBLM48mmINSxJspyW3fGKk4sgt_VO2s"
  );

  // TODO proper fetching for the token

  async function refresh(access_token: string) {
    console.log("REFRESHING");

    const response: {
      firstName: string;
      lastName: string;
      username: string;

      role: number;
      id: number;
    } = (
      await AxiosInstance.post(
        "/refresh",
        {},
        {
          headers: {
            Authorization: "Bearer " + access_token,
          },
        }
      )
    ).data;

    AxiosInstance.defaults.headers.common = {
      Authorization: `Bearer ${access_token}`,
    };

    userProfile.username = response.username;
    userProfile.role = RoleMap[response.role];

    userProfile.fullname = response.firstName + " " + response.lastName;
  }

  async function login(username: string, password: string): Promise<void> {
    // fetch the login endpoint
    const response: {
      name: string;
      access_token: string;
      username: string;

      role: number;
      id: number;
    } = (
      await AxiosInstance.post("/login", {
        username: username,
        password: password,
      })
    ).data;

    AxiosInstance.defaults.headers.common = {
      Authorization: `Bearer ${response.access_token}`,
    };
    sessionStorage.setItem("accessToken", response.access_token);
    // store the token in localStorage
    // populate the state
    userProfile.username = username;
    userProfile.role = RoleMap[response.role];
    userProfile.fullname = response.name;
  }

  function logout(): void {
    userProfile.username = "";

    userProfile.role = Role.UNSET;

    // remove the token from axios headers
    AxiosInstance.defaults.headers.common = {
      Authorization: null,
    };
    sessionStorage.removeItem("accessToken");
  }

  return readonly({ userProfile, login, logout, refresh });
});
