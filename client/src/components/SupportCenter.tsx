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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Ticket, ArrowLeft, ExternalLink, Clock, CheckCircle2, AlertCircle, MessageSquare, Trash2, FileText, Monitor, Building2, Car, Calendar, MapPin, AlertTriangle, Loader2 } from "lucide-react";
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

interface NewTicketFormProps {
  onSuccess: (ticketNumber: string) => void;
  onCancel: () => void;
}

function NewTicketForm({ onSuccess, onCancel }: NewTicketFormProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    serviceType: "",
    issueDescription: "",
    userEmail: "",
    userPhone: "",
    nationalId: "",
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/tickets", data);
      return response.json();
    },
    onSuccess: (ticket) => {
      toast({
        title: t("ticketSuccess"),
        description: `${t("ticketNumber")}: ${ticket.ticketNumber}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      onSuccess(ticket.ticketNumber);
    },
    onError: () => {
      toast({
        title: t("ticketError"),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serviceType || !formData.issueDescription || !formData.userEmail) {
      toast({
        title: language === "ar" ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createTicketMutation.mutate(formData);
  };

  const getServiceIcon = (serviceType: string) => {
    const service = SERVICE_TYPES.find(s => s.value === serviceType);
    return service?.icon || Monitor;
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            data-testid="button-back-to-tickets"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle className="text-xl">{t("createTicket")}</CardTitle>
            <CardDescription>
              {language === "ar" 
                ? "أخبرنا بمشكلتك وسنساعدك في حلها"
                : "Tell us about your issue and we'll help you resolve it"
              }
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-base font-medium">{t("serviceType")} *</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {SERVICE_TYPES.map((service) => {
                const Icon = service.icon;
                const isSelected = formData.serviceType === service.value;
                return (
                  <Button
                    key={service.value}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    className={`flex flex-col h-auto py-3 gap-1 ${isSelected ? "" : ""}`}
                    onClick={() => setFormData({ ...formData, serviceType: service.value })}
                    data-testid={`button-service-${service.value}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs text-center leading-tight">{t(service.labelKey)}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="issueDescription" className="text-base font-medium">
              {t("issueDescription")} *
            </Label>
            <Textarea
              id="issueDescription"
              placeholder={t("describeIssue")}
              value={formData.issueDescription}
              onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
              className="min-h-[120px] text-base"
              data-testid="textarea-issue-description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="userEmail" className="text-base font-medium">
              {t("yourEmail")} *
            </Label>
            <Input
              id="userEmail"
              type="email"
              placeholder={language === "ar" ? "example@email.com" : "example@email.com"}
              value={formData.userEmail}
              onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
              className="text-base"
              data-testid="input-user-email"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="userPhone" className="text-base font-medium">
                {t("yourPhone")}
              </Label>
              <Input
                id="userPhone"
                type="tel"
                placeholder="+966 5X XXX XXXX"
                value={formData.userPhone}
                onChange={(e) => setFormData({ ...formData, userPhone: e.target.value })}
                className="text-base"
                dir="ltr"
                data-testid="input-user-phone"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationalId" className="text-base font-medium">
                {t("nationalIdOptional")}
              </Label>
              <Input
                id="nationalId"
                placeholder="10XXXXXXXX"
                value={formData.nationalId}
                onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                className="text-base"
                dir="ltr"
                data-testid="input-national-id"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              type="submit"
              size="lg"
              className="w-full text-lg py-6"
              disabled={createTicketMutation.isPending}
              data-testid="button-submit-ticket"
            >
              {createTicketMutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t("submitting")}
                </>
              ) : (
                <>
                  <Ticket className="h-5 w-5" />
                  {t("submitTicket")}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              data-testid="button-cancel-ticket"
            >
              {t("close")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

interface TicketCardProps {
  ticket: SupportTicket;
  onClick: () => void;
}

function TicketCard({ ticket, onClick }: TicketCardProps) {
  const { t, language } = useLanguage();
  const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.NEW;
  const StatusIcon = status.icon;

  return (
    <Card
      className="cursor-pointer hover-elevate active-elevate-2 transition-all"
      onClick={onClick}
      data-testid={`card-ticket-${ticket.ticketNumber}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm text-muted-foreground">
                {ticket.ticketNumber}
              </span>
              <Badge variant="secondary" className={status.color}>
                <StatusIcon className="h-3 w-3" />
                {getStatusLabel(ticket.status, t)}
              </Badge>
            </div>
            <p className="mt-2 text-sm line-clamp-2">
              {ticket.issueDescription}
            </p>
            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
              <span>{getServiceLabel(ticket.serviceType, t)}</span>
              <span>
                {new Date(ticket.createdAt!).toLocaleDateString(
                  language === "ar" ? "ar-SA" : "en-US",
                  { year: "numeric", month: "short", day: "numeric" }
                )}
              </span>
            </div>
          </div>
          <Button variant="ghost" size="icon" data-testid={`button-view-ticket-${ticket.ticketNumber}`}>
            <ArrowLeft className="h-4 w-4 rotate-180 rtl:rotate-0" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface TicketDetailsViewProps {
  ticketNumber: string;
  onBack: () => void;
  userEmail?: string;
}

function TicketDetailsView({ ticketNumber, onBack, userEmail }: TicketDetailsViewProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: ticket, isLoading } = useQuery<SupportTicket>({
    queryKey: ["/api/tickets", ticketNumber],
  });

  const { data: comments } = useQuery<TicketComment[]>({
    queryKey: ["/api/tickets", ticket?.id, "comments"],
    enabled: !!ticket?.id,
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/tickets/${ticket?.id}/comments`, {
        content,
        authorName: userEmail || "User",
        isAdminComment: false,
      });
      return response.json();
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/tickets", ticket?.id, "comments"] });
      toast({
        title: language === "ar" ? "تم إضافة التعليق" : "Comment added",
      });
    },
  });

  const deleteTicketMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/tickets/${ticket?.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      toast({
        title: language === "ar" ? "تم حذف الطلب" : "Ticket deleted",
      });
      onBack();
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="mt-4 text-lg">{t("ticketNotFound")}</p>
          <Button onClick={onBack} className="mt-4" data-testid="button-back-not-found">
            {t("backToTickets")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.NEW;
  const StatusIcon = status.icon;
  const aiSolution = ticket.aiSolution;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" onClick={onBack} data-testid="button-back-to-list">
          <ArrowLeft className="h-4 w-4" />
          {t("backToTickets")}
        </Button>
        <div className="flex-1" />
        <Button
          variant="outline"
          asChild
          data-testid="button-absher-link"
        >
          <a href="https://www.absher.sa" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            {t("goToAbsher")}
          </a>
        </Button>
      </div>

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
                  { year: "numeric", month: "long", day: "numeric" }
                )}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={() => setShowDeleteDialog(true)}
              data-testid="button-delete-ticket"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground">{t("issueDescription")}</Label>
            <p className="mt-1 whitespace-pre-wrap">{ticket.issueDescription}</p>
          </div>
          <div className="flex gap-4 flex-wrap text-sm text-muted-foreground">
            <span>{t("yourEmail")}: {ticket.userEmail}</span>
            {ticket.userPhone && <span>{t("yourPhone")}: {ticket.userPhone}</span>}
          </div>
        </CardContent>
      </Card>

      {aiSolution && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              {t("aiSolution")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-base">
              {language === "ar" ? aiSolution.explanationAr : aiSolution.explanation}
            </p>

            {aiSolution.canBeSolvedOnline !== undefined && (
              <div className="flex items-center gap-2">
                {aiSolution.canBeSolvedOnline ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <Monitor className="h-3 w-3" />
                    {t("canBeSolvedOnline")}
                  </Badge>
                ) : aiSolution.requiresBranch ? (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                    <Building2 className="h-3 w-3" />
                    {t("requiresBranchVisit")}
                  </Badge>
                ) : null}
              </div>
            )}

            {aiSolution.steps && aiSolution.steps.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">{t("stepByStep")}</h4>
                <ol className="space-y-2">
                  {aiSolution.steps.map((step, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span>{language === "ar" ? step.ar : step.en}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {aiSolution.documents && aiSolution.documents.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">{t("requiredDocuments")}</h4>
                <ul className="list-disc list-inside space-y-1">
                  {aiSolution.documents.map((doc, index) => (
                    <li key={index}>{language === "ar" ? doc.ar : doc.en}</li>
                  ))}
                </ul>
              </div>
            )}

            {aiSolution.officialLinks && aiSolution.officialLinks.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">{t("officialLinks")}</h4>
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
              </div>
            )}

            {(aiSolution.recommendation || aiSolution.recommendationAr) && (
              <div className="bg-muted/50 p-4 rounded-md">
                <h4 className="font-medium mb-1">{t("aiRecommendation")}</h4>
                <p className="text-sm text-muted-foreground">
                  {language === "ar" ? aiSolution.recommendationAr : aiSolution.recommendation}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
                      <span className="font-medium text-sm">
                        {comment.isAdminComment ? t("admin") : comment.authorName}
                      </span>
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
              placeholder={t("writeComment")}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1"
              data-testid="textarea-new-comment"
            />
            <Button
              onClick={() => newComment.trim() && addCommentMutation.mutate(newComment)}
              disabled={!newComment.trim() || addCommentMutation.isPending}
              data-testid="button-post-comment"
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

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteTicket")}</DialogTitle>
            <DialogDescription>{t("confirmDeleteTicket")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              {t("close")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteTicketMutation.mutate()}
              disabled={deleteTicketMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteTicketMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("deleteTicket")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function SupportCenter() {
  const { t, language } = useLanguage();
  const [view, setView] = useState<"list" | "create" | "details">("list");
  const [selectedTicketNumber, setSelectedTicketNumber] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [emailInput, setEmailInput] = useState("");

  const { data: tickets, isLoading } = useQuery<SupportTicket[]>({
    queryKey: ["/api/tickets/user", userEmail],
    enabled: !!userEmail,
  });

  const handleViewTicket = (ticketNumber: string) => {
    setSelectedTicketNumber(ticketNumber);
    setView("details");
  };

  const handleTicketCreated = (ticketNumber: string) => {
    setSelectedTicketNumber(ticketNumber);
    setView("details");
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setUserEmail(emailInput.trim());
    }
  };

  if (view === "create") {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <NewTicketForm
          onSuccess={handleTicketCreated}
          onCancel={() => setView("list")}
        />
      </div>
    );
  }

  if (view === "details" && selectedTicketNumber) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <TicketDetailsView
          ticketNumber={selectedTicketNumber}
          onBack={() => {
            setSelectedTicketNumber(null);
            setView("list");
          }}
          userEmail={userEmail}
        />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">{t("supportCenter")}</h1>
          <p className="text-muted-foreground">
            {language === "ar"
              ? "احصل على المساعدة في خدماتك الحكومية"
              : "Get help with your government services"
            }
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => setView("create")}
          className="gap-2"
          data-testid="button-create-ticket"
        >
          <Plus className="h-5 w-5" />
          {t("createTicket")}
        </Button>
      </div>

      {!userEmail ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("myTickets")}</CardTitle>
            <CardDescription>
              {language === "ar"
                ? "أدخل بريدك الإلكتروني لعرض طلباتك"
                : "Enter your email to view your tickets"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailSubmit} className="flex gap-3">
              <Input
                type="email"
                placeholder={language === "ar" ? "بريدك الإلكتروني" : "Your email address"}
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="flex-1"
                data-testid="input-lookup-email"
              />
              <Button type="submit" data-testid="button-lookup-tickets">
                {language === "ar" ? "عرض الطلبات" : "View Tickets"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h2 className="text-lg font-semibold">{t("myTickets")}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUserEmail("")}
              data-testid="button-change-email"
            >
              {language === "ar" ? "تغيير البريد" : "Change email"}
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : tickets && tickets.length > 0 ? (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onClick={() => handleViewTicket(ticket.ticketNumber)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">{t("noTickets")}</h3>
                <p className="text-muted-foreground mt-1">{t("noTicketsDesc")}</p>
                <Button
                  className="mt-4"
                  onClick={() => setView("create")}
                  data-testid="button-create-first-ticket"
                >
                  <Plus className="h-4 w-4" />
                  {t("createTicket")}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <ExternalLink className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium">
                {language === "ar" 
                  ? "هل تحتاج إلى دعم رسمي؟"
                  : "Need official support?"
                }
              </p>
              <p className="text-sm text-muted-foreground">
                {language === "ar"
                  ? "قم بزيارة منصة أبشر للدعم الرسمي"
                  : "Visit Absher platform for official support"
                }
              </p>
            </div>
            <Button variant="outline" asChild data-testid="button-absher-official">
              <a href="https://www.absher.sa" target="_blank" rel="noopener noreferrer">
                {t("goToAbsher")}
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}