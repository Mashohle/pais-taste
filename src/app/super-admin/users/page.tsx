"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Search, Mail, Phone, MapPin, Calendar, ShieldAlert, CheckCircle } from "lucide-react"

export default function UsersManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
        <p className="text-slate-600 mt-1">Manage customer accounts and support requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Total Users</p>
                <p className="text-3xl font-bold text-blue-600">15,632</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Active Users</p>
                <p className="text-3xl font-bold text-green-600">12,847</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Support Requests</p>
                <p className="text-3xl font-bold text-yellow-600">23</p>
              </div>
              <ShieldAlert className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
              <Input placeholder="Search users..." className="pl-10" />
            </div>
            <Button variant="outline">Export Users</Button>
          </div>
          
          <div className="text-center py-12 text-slate-500">
            <Users className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">User Management Coming Soon</h3>
            <p className="text-sm">Advanced user management features will be available here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}