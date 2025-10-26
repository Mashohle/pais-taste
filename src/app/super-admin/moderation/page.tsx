"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, AlertTriangle, MessageSquare, Flag, CheckCircle, XCircle } from "lucide-react"

export default function Moderation() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Content Moderation</h1>
        <p className="text-slate-600 mt-1">Review disputes, reports, and platform content</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Active Disputes</p>
                <p className="text-3xl font-bold text-red-600">2</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Pending Reviews</p>
                <p className="text-3xl font-bold text-yellow-600">8</p>
              </div>
              <MessageSquare className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Flagged Content</p>
                <p className="text-3xl font-bold text-orange-600">5</p>
              </div>
              <Flag className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Resolved Today</p>
                <p className="text-3xl font-bold text-green-600">12</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Active Disputes
              <Badge variant="destructive">2 Urgent</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-slate-900">Order #1234 - Elite Car Wash</p>
                    <p className="text-sm text-slate-600">Customer: John Doe</p>
                    <p className="text-sm text-slate-600">Issue: Service quality complaint</p>
                    <p className="text-xs text-slate-500 mt-2">Reported 2 hours ago</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Resolve
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-slate-900">Review #5678 - Urban Streetwear</p>
                    <p className="text-sm text-slate-600">Customer: Sarah Smith</p>
                    <p className="text-sm text-slate-600">Issue: Inappropriate review content</p>
                    <p className="text-xs text-slate-500 mt-2">Reported 4 hours ago</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Resolve
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Moderation Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-slate-900">New Business Review</p>
                    <p className="text-sm text-slate-600">Mama Zulu&apos;s Kitchen - Content Review</p>
                    <p className="text-xs text-slate-500 mt-2">Pending 1 day</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline">
                      <XCircle className="w-3 h-3 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Moderation Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-slate-500">
            <Shield className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Advanced Moderation Dashboard</h3>
            <p className="text-sm">Comprehensive moderation tools and automated content filtering.</p>
            <Button className="mt-4" variant="outline">Configure Moderation Rules</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}