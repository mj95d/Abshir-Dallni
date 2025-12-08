import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/lib/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Search, Ticket, ArrowLeft, ExternalLink, Clock, CheckCircle2, AlertCircle, MessageSquare, Save, Loader2, Settings, Users, FileText, Car, Calendar, MapPin, Building2, Monitor, AlertTriangle } from "lucide-react";
import type { SupportTicket, TicketComment } from "@shared/schema";

const SERVICE_TYPES = [
  { value: "iqama", labelKey: "serviceIqama", icon: FileText },
  { value: "vehicle_transfer", labelKey: "serviceVehicleTransfer", icon: Car },
  { value: "vehicle_renewal", labelKey: "serviceVehicleRenewal", icon: Car },
  { value: "reports", labelKey: "serviceReports", icon: AlertTriangle },
  { value: "appointments", labelKey: "serviceAppointments", icon: Calendar },
  { value: "baladi", labelKey: "serviceBaladi", icon: Building2 },
  { value: "traffic", labelKey: "serviceTraffic", icon: MapPin },
  { value: "other", labelKey: "serviceOther", icon: Monitor },
];

const STATUS_OPTIONS = [
  { value: "NEW", labelKey: "statusNew" },
  { value: "IN_REVIEW", labelKey: "statusInReview" },
  { value: "RESOLVED", labelKey: "statusResolved" },
  { value: "REQUIRES_OFFICIAL_CONTACT", labelKey: "statusRequiresOfficial" },
];

const STATUS_CONFIG: Record<string, { labelKey: string; color: string; icon: typeof Clock }> = {
  NEW: { labelKey: "statusNew", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", icon: Clock },
  IN_REVIEW: { labelKey: "statusInReview", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", icon: AlertCircle },
  RESOLVED: { labelKey: "statusResolved", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: CheckCircle2 },
  REQUIRES_OFFICIAL_CONTACT: { labelKey: "statusRequiresOfficial", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200", icon: ExternalLink },
};

function getServiceLabel(serviceType: string, t: (key: string) => string): string {
  const service = SERVICE_TYPES.find(s => s.value === serviceType);
  return service ? t(service.labelKey) : serviceType;
}

function getStatusLabel(status: string, t: (key: string) => string): string {
  const config = STATUS_CONFIG[status];
  return config ? t(config.labelKey) : status;
}

interface AdminTicketDetailsProps {
  ticket: SupportTicket;
  onBack: () => void;
}

function AdminTicketDetails({ ticket, onBack }: AdminTicketDetailsProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [adminNotes, setAdminNotes] = useState(ticket.adminNotes || "");
  const [newComment, setNewComment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(ticket.status);

  const { data: comments, refetch: refetchComments } = useQuery<TicketComment[]>({
    queryKey: ["/api/tickets", ticket.id, "comments"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await apiRequest("PUT", `/api/tickets/${ticket.id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      toast({
        title: language === "ar" ? "تم تحديث الحالة" : "Status updated",
      });
    },
  });

  const updateNotesMutation = useMutation({
    mutationFn: async (notes: string) => {
      const response = await apiRequest("PUT", `/api/tickets/${ticket.id}/admin-notes`, { adminNotes: notes });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      toast({
        title: language === "ar" ? "تم حفظ الملاحظات" : "Notes saved",
      });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/tickets/${ticket.id}/comments`, {
        content,
        authorName: "Admin",
        isAdminComment: true,
      });
      return response.json();
    },
    onSuccess: () => {
      setNewComment("");
      refetchComments();
      toast({
        title: language === "ar" ? "تم إضافة التعليق" : "Comment added",
      });
    },
  });

  const generateAiSolutionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PUT", `/api/tickets/${ticket.id}/ai-solution`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      toast({
        title: language === "ar" ? "تم إنشاء الحل" : "Solution generated",
      });
    },
  });

  const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.NEW;
  const StatusIcon = status.icon;
  const aiSolution = ticket.aiSolution;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" onClick={onBack} data-testid="button-admin-back">
          <ArrowLeft className="h-4 w-4" />
          {t("backToTickets")}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="font-mono">{ticket.ticketNumber}</CardTitle>
                    <Badge variant="secondary" className={status.color}>
                      <StatusIcon className="h-3 w-3" />
                      {getStatusLabel(ticket.status, t)}
                    </Badge>
                  </div>
                  <CardDescription className="mt-1">
                    {getServiceLabel(ticket.serviceType, t)} • {t("ticketCreated")}:{" "}
                    {new Date(ticket.createdAt!).toLocaleDateString(
                      language === "ar" ? "ar-SA" : "en-US",
                      { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">{t("issueDescription")}</Label>
                <p className="mt-1 whitespace-pre-wrap">{ticket.issueDescription}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <Label className="text-muted-foreground">{t("yourEmail")}</Label>
                  <p>{ticket.userEmail}</p>
                </div>
                {ticket.userPhone && (
                  <div>
                    <Label className="text-muted-foreground">{t("yourPhone")}</Label>
                    <p dir="ltr">{ticket.userPhone}</p>
                  </div>
                )}
                {ticket.nationalId && (
                  <div>
                    <Label className="text-muted-foreground">{t("nationalIdOptional")}</Label>
                    <p dir="ltr">{ticket.nationalId}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {aiSolution ? (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  {t("aiSolution")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{language === "ar" ? aiSolution.explanationAr : aiSolution.explanation}</p>
                
                {aiSolution.steps && aiSolution.steps.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">{t("stepByStep")}</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      {aiSolution.steps.map((step, index) => (
                        <li key={index}>{language === "ar" ? step.ar : step.en}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {aiSolution.officialLinks && aiSolution.officialLinks.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {aiSolution.officialLinks.map((link, index) => (
                      <Button key={index} variant="outline" size="sm" asChild>
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                          {link.name}
                        </a>
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-4">
                  {language === "ar" ? "لم يتم إنشاء حل بعد" : "No AI solution generated yet"}
                </p>
                <Button
                  onClick={() => generateAiSolutionMutation.mutate()}
                  disabled={generateAiSolutionMutation.isPending}
                  data-testid="button-generate-ai-solution"
                >
                  {generateAiSolutionMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("analyzing")}
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4" />
                      {language === "ar" ? "إنشاء حل بالذكاء الاصطناعي" : "Generate AI Solution"}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5" />
                {t("comments")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {comments && comments.length > 0 ? (
                <ScrollArea className="max-h-64">
                  <div className="space-y-3">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className={`p-3 rounded-md ${
                          comment.isAdminComment ? "bg-primary/10" : "bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={comment.isAdminComment ? "default" : "secondary"} className="text-xs">
                            {comment.isAdminComment ? t("admin") : t("user")}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt!).toLocaleString(
                              language === "ar" ? "ar-SA" : "en-US",
                              { dateStyle: "short", timeStyle: "short" }
                            )}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t("noCommentsYet")}
                </p>
              )}

              <div className="flex gap-2">
                <Textarea
                  placeholder={language === "ar" ? "رد المشرف..." : "Admin reply..."}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1"
                  data-testid="textarea-admin-comment"
                />
                <Button
                  onClick={() => newComment.trim() && addCommentMutation.mutate(newComment)}
                  disabled={!newComment.trim() || addCommentMutation.isPending}
                  data-testid="button-admin-post-comment"
                >
                  {addCommentMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t("postComment")
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {ticket.timeline && ticket.timeline.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5" />
                  {t("timeline")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative space-y-4">
                  {ticket.timeline.map((entry, index) => (
                    <div key={index} className="flex gap-3 relative">
                      <div className="absolute left-[5px] top-3 bottom-0 w-px bg-border" 
                        style={{ display: index === ticket.timeline!.length - 1 ? "none" : "block" }} 
                      />
                      <div className="w-3 h-3 rounded-full bg-primary mt-1.5 flex-shrink-0 z-10" />
                      <div className="flex-1 pb-4">
                        <p className="font-medium">{language === "ar" ? entry.actionAr : entry.action}</p>
                        <div className="flex gap-2 text-sm text-muted-foreground">
                          <span>{entry.actor}</span>
                          <span>•</span>
                          <span>
                            {new Date(entry.timestamp).toLocaleString(
                              language === "ar" ? "ar-SA" : "en-US",
                              { dateStyle: "short", timeStyle: "short" }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("updateStatus")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={selectedStatus}
                onValueChange={(value) => {
                  setSelectedStatus(value);
                  updateStatusMutation.mutate(value);
                }}
              >
                <SelectTrigger data-testid="select-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {updateStatusMutation.isPending && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {language === "ar" ? "جاري التحديث..." : "Updating..."}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("adminNotes")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={language === "ar" ? "ملاحظات داخلية للمشرفين..." : "Internal notes for admins..."}
                className="min-h-[100px]"
                data-testid="textarea-admin-notes"
              />
              <Button
                onClick={() => updateNotesMutation.mutate(adminNotes)}
                disabled={updateNotesMutation.isPending}
                className="w-full"
                data-testid="button-save-notes"
              >
                {updateNotesMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {t("saveNotes")}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const { t, language } = useLanguage();
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: tickets, isLoading } = useQuery<SupportTicket[]>({
    queryKey: ["/api/tickets"],
  });

  const filteredTickets = tickets?.filter((ticket) => {
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.issueDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const ticketStats = tickets
    ? {
        total: tickets.length,
        new: tickets.filter((t) => t.status === "NEW").length,
        inReview: tickets.filter((t) => t.status === "IN_REVIEW").length,
        resolved: tickets.filter((t) => t.status === "RESOLVED").length,
        requiresOfficial: tickets.filter((t) => t.status === "REQUIRES_OFFICIAL_CONTACT").length,
      }
    : null;

  if (selectedTicket) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <AdminTicketDetails
          ticket={selectedTicket}
          onBack={() => setSelectedTicket(null)}
        />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("adminDashboard")}</h1>
        <p className="text-muted-foreground">
          {language === "ar"
            ? "إدارة طلبات الدعم ومساعدة المستخدمين"
            : "Manage support tickets and help users"
          }
        </p>
      </div>

      {ticketStats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-muted">
                  <Ticket className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{ticketStats.total}</p>
                  <p className="text-xs text-muted-foreground">{t("allTickets")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{ticketStats.new}</p>
                  <p className="text-xs text-muted-foreground">{t("statusNew")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-yellow-100 dark:bg-yellow-900">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{ticketStats.inReview}</p>
                  <p className="text-xs text-muted-foreground">{t("statusInReview")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-green-100 dark:bg-green-900">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{ticketStats.resolved}</p>
                  <p className="text-xs text-muted-foreground">{t("statusResolved")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-orange-100 dark:bg-orange-900">
                  <ExternalLink className="h-5 w-5 text-orange-600 dark:text-orange-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{ticketStats.requiresOfficial}</p>
                  <p className="text-xs text-muted-foreground truncate">{t("statusRequiresOfficial")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle>{t("allTickets")}</CardTitle>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("searchTickets")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                  data-testid="input-search-tickets"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40" data-testid="select-filter-status">
                  <SelectValue placeholder={t("filterByStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allStatuses")}</SelectItem>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : filteredTickets && filteredTickets.length > 0 ? (
            <div className="space-y-2">
              {filteredTickets.map((ticket) => {
                const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.NEW;
                const StatusIcon = status.icon;
                return (
                  <div
                    key={ticket.id}
                    className="p-4 border rounded-md cursor-pointer hover-elevate active-elevate-2 transition-all"
                    onClick={() => setSelectedTicket(ticket)}
                    data-testid={`admin-ticket-${ticket.ticketNumber}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm">{ticket.ticketNumber}</span>
                          <Badge variant="secondary" className={status.color}>
                            <StatusIcon className="h-3 w-3" />
                            {getStatusLabel(ticket.status, t)}
                          </Badge>
                          <Badge variant="outline">{getServiceLabel(ticket.serviceType, t)}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                          {ticket.issueDescription}
                        </p>
                        <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                          <span>{ticket.userEmail}</span>
                          <span>
                            {new Date(ticket.createdAt!).toLocaleDateString(
                              language === "ar" ? "ar-SA" : "en-US"
                            )}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" data-testid={`button-admin-view-${ticket.ticketNumber}`}>
                        {t("viewTicket")}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t("noTickets")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}