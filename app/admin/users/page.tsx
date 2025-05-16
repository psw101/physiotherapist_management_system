"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Heading, Table, Button, Dialog, Flex, Text, Card } from "@radix-ui/themes";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/admin/users");
        setUsers(response.data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError("Failed to load users data");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = async (id: string) => {
    try {
      await axios.delete(`/api/admin/users/${id}`);
      setUsers(users.filter(user => user.id !== id));
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert("Failed to delete user. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-4 bg-red-50 border border-red-200">
        <Text color="red">{error}</Text>
      </Card>
    );
  }

  return (
    <div>
      <Flex justify="between" align="center" className="mb-6">
        <Heading size="6">Users Management</Heading>
        <Button>Add New User</Button>
      </Flex>

      <Card>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Role</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Created At</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {users.map((user) => (
              <Table.Row key={user.id}>
                <Table.Cell>{user.name}</Table.Cell>
                <Table.Cell>{user.email}</Table.Cell>
                <Table.Cell>
                  <Text className={`
                    px-2 py-1 rounded-full text-xs 
                    ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : ''}
                    ${user.role === 'PATIENT' ? 'bg-blue-100 text-blue-800' : ''}
                    ${user.role === 'PHYSIOTHERAPIST' ? 'bg-green-100 text-green-800' : ''}
                  `}>
                    {user.role}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </Table.Cell>
                <Table.Cell>
                  <Flex gap="2">
                    <Button variant="soft" size="1">
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Dialog.Root>
                      <Dialog.Trigger>
                        <Button variant="soft" color="red" size="1">
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </Dialog.Trigger>
                      <Dialog.Content>
                        <Dialog.Title>Delete User</Dialog.Title>
                        <Dialog.Description>
                          Are you sure you want to delete this user? This action cannot be undone.
                        </Dialog.Description>
                        <Flex gap="3" mt="4" justify="end">
                          <Dialog.Close>
                            <Button variant="soft">Cancel</Button>
                          </Dialog.Close>
                          <Dialog.Close>
                            <Button 
                              variant="solid" 
                              color="red"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              Delete
                            </Button>
                          </Dialog.Close>
                        </Flex>
                      </Dialog.Content>
                    </Dialog.Root>
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Card>
    </div>
  );
}