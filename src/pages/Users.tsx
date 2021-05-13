import React from "react";
import AppShell from "../components/AppShell";
import { GetUsersQuery } from "../types/sdk";
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "../components/Table";

type UsersParams = {
  usersQuery: GetUsersQuery;
};

export default function Users({ usersQuery }: UsersParams) {
  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>STAN Users</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="mx-auto">
          <Table>
            <TableHead>
              <TableHeader>Username</TableHeader>
              <TableHeader>Role</TableHeader>
            </TableHead>

            <TableBody>
              {usersQuery.users.map((user) => (
                <tr>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.role}</TableCell>
                </tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
