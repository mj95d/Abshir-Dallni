import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/lib/LanguageContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Smartphone,
  Monitor,
  Tablet,
  AlertTriangle,
  Shield,
  Clock,
  Globe,
  Palette,
  X,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { UserDevice } from "@shared/schema";

interface DeviceInfo {
  device: string;
  os: string;
  browser: string;
  userAgent: string;
  screen: string;
  theme: string;
  lang: string;
}

function getDeviceInfo(): DeviceInfo {
  const ua = navigator.userAgent;
  
  let device = "Desktop";
  if (/Mobile|Android|iPhone|iPad|iPod/i.test(ua)) {
    if (/iPad|Tablet/i.test(ua)) {
      device = "Tablet";
    } else {
      device = "Mobile";
    }
  }

  let os = "Unknown";
  if (/Windows NT 10/i.test(ua)) os = "Windows 10";
  else if (/Windows NT 11/i.test(ua) || /Windows NT 10.0.*Win64/i.test(ua)) os = "Windows 11";
  else if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS X/i.test(ua)) os = "macOS";
  else if (/Linux/i.test(ua)) os = "Linux";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iOS|iPhone|iPad/i.test(ua)) os = "iOS";

  let browser = "Unknown";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/Chrome/i.test(ua) && !/Chromium/i.test(ua)) browser = "Chrome";
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
  else if (/Firefox/i.test(ua)) browser = "Firefox";
  else if (/Opera|OPR/i.test(ua)) browser = "Opera";

  const screen = `${window.screen.width}x${window.screen.height}`;
  const theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const lang = navigator.language || "en";

  return {
    device,
    os,
    browser,
    userAgent: ua,
    screen,
    theme,
    lang,
  };
}

const deviceIcons: Record<string, typeof Monitor> = {
  Desktop: Monitor,
  Mobile: Smartphone,
  Tablet: Tablet,
};

interface DeviceDetectionProps {
  userId?: string;
  onNewDevice?: (device: DeviceInfo) => void;
}

interface DeviceUpdateResponse {
  message: string;
  device: UserDevice;
  isNewDevice: boolean;
  previousDevices?: { device: string; browser: string; lastSeen: string | Date | null }[];
}

export function DeviceDetection({ userId, onNewDevice }: DeviceDetectionProps) {
  const { language, t } = useLanguage();
  const [showAlert, setShowAlert] = useState(false);
  const [showDevices, setShowDevices] = useState(false);
  const [newDeviceData, setNewDeviceData] = useState<DeviceUpdateResponse | null>(null);
  const [currentDevice, setCurrentDevice] = useState<DeviceInfo | null>(null);
  const ChevronIcon = language === "ar" ? ChevronLeft : ChevronRight;

  const { data: devices, isLoading: devicesLoading } = useQuery<UserDevice[]>({
    queryKey: ["/api/device", userId],
    enabled: !!userId,
  });

  const updateDeviceMutation = useMutation({
    mutationFn: async (deviceInfo: DeviceInfo) => {
      const response = await apiRequest("POST", "/api/device/update", {
        userId,
        ...deviceInfo,
      });
      return response.json() as Promise<DeviceUpdateResponse>;
    },
    onSuccess: (data) => {
      if (data.isNewDevice) {
        setNewDeviceData(data);
        setShowAlert(true);
        if (onNewDevice && currentDevice) {
          onNewDevice(currentDevice);
        }
      }
      queryClient.invalidateQueries({ queryKey: ["/api/device", userId] });
    },
  });

  const deleteDeviceMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      await apiRequest("DELETE", `/api/device/${deviceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/device", userId] });
    },
  });

  useEffect(() => {
    const deviceInfo = getDeviceInfo();
    setCurrentDevice(deviceInfo);
    
    if (userId) {
      updateDeviceMutation.mutate(deviceInfo);
    }
  }, [userId]);

  const formatDate = (date: string | Date | null) => {
    if (!date) return language === "en" ? "Unknown" : "غير معروف";
    const d = new Date(date);
    return d.toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!currentDevice) {
    return (
      <Card className="p-4">
        <Skeleton className="h-6 w-1/3 mb-4" />
        <Skeleton className="h-16 w-full" />
      </Card>
    );
  }

  const DeviceIcon = deviceIcons[currentDevice.device] || Monitor;

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h3 className="font-semibold flex items-center gap-2 flex-wrap">
            <Shield className="h-4 w-4" />
            {language === "en" ? "Device Security" : "أمان الجهاز"}
          </h3>
          <Badge variant="default" className="bg-primary gap-1">
            <Shield className="h-3 w-3" />
            {language === "en" ? "Protected" : "محمي"}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
              <DeviceIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm">
                {currentDevice.device} - {currentDevice.browser}
              </div>
              <div className="text-xs text-muted-foreground">
                {currentDevice.os}
              </div>
            </div>
            <Badge variant="secondary" className="text-xs shrink-0">
              {language === "en" ? "Current" : "الحالي"}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-md bg-muted/30">
              <Globe className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <div className="text-xs">{currentDevice.lang}</div>
            </div>
            <div className="p-2 rounded-md bg-muted/30">
              <Monitor className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <div className="text-xs">{currentDevice.screen}</div>
            </div>
            <div className="p-2 rounded-md bg-muted/30">
              <Palette className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <div className="text-xs capitalize">{currentDevice.theme}</div>
            </div>
          </div>

          {userId && devices && devices.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => setShowDevices(true)}
              data-testid="button-view-devices"
            >
              {language === "en" ? "View All Devices" : "عرض جميع الأجهزة"}
              <Badge variant="secondary" className="text-xs">
                {devices.length}
              </Badge>
              <ChevronIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>

      <Dialog open={showAlert} onOpenChange={setShowAlert}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
              <AlertTriangle className="h-5 w-5" />
              {language === "en" ? "New Device Detected" : "تم اكتشاف جهاز جديد"}
            </DialogTitle>
            <DialogDescription>
              {language === "en"
                ? "We detected a login from a new device. If this wasn't you, please secure your account immediately."
                : "اكتشفنا تسجيل دخول من جهاز جديد. إذا لم يكن هذا أنت، يرجى تأمين حسابك فوراً."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="p-3 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
              <div className="font-medium text-sm mb-2">
                {language === "en" ? "New Device" : "الجهاز الجديد"}
              </div>
              <div className="text-sm text-muted-foreground">
                {currentDevice.device} - {currentDevice.browser} ({currentDevice.os})
              </div>
            </div>

            {newDeviceData?.previousDevices && newDeviceData.previousDevices.length > 0 && (
              <div>
                <div className="font-medium text-sm mb-2">
                  {language === "en" ? "Your Other Devices" : "أجهزتك الأخرى"}
                </div>
                <div className="space-y-2">
                  {newDeviceData.previousDevices.map((device, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Clock className="h-3 w-3" />
                      {device.device} - {device.browser} ({formatDate(device.lastSeen)})
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowAlert(false)}
                data-testid="button-dismiss-alert"
              >
                {language === "en" ? "It's Me" : "هذا أنا"}
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  window.open("https://www.absher.sa", "_blank");
                  setShowAlert(false);
                }}
                data-testid="button-secure-account"
              >
                {language === "en" ? "Secure Account" : "تأمين الحساب"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDevices} onOpenChange={setShowDevices}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {language === "en" ? "Your Devices" : "أجهزتك"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-4 max-h-80 overflow-y-auto">
            {devicesLoading ? (
              [1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))
            ) : (
              devices?.map((device) => {
                const Icon = deviceIcons[device.device] || Monitor;
                const isCurrent = device.userAgent === currentDevice.userAgent;
                return (
                  <div
                    key={device.id}
                    className="flex items-center gap-3 p-3 rounded-md bg-muted/50"
                  >
                    <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm flex items-center gap-2 flex-wrap">
                        {device.device} - {device.browser}
                        {isCurrent && (
                          <Badge variant="secondary" className="text-xs">
                            {language === "en" ? "Current" : "الحالي"}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {device.os}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(device.lastSeen)}
                      </div>
                    </div>
                    {!isCurrent && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteDeviceMutation.mutate(device.id)}
                        disabled={deleteDeviceMutation.isPending}
                        data-testid={`button-remove-device-${device.id}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
