import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, ShieldCheck, Cpu, HardDrive, Database, Info, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { adminApi } from "@/api/admin";
import type { SystemStatsResponse } from "@/lib/apiTypes";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface HistoryItem {
  time: string;
  cpu: number;
  memory: number;
}

const HISTORY_STORAGE_KEY = "gomguk_admin_stats_history";
const MAX_HISTORY_LEN = 12; // 12 items * 5 min = 1 hour history
const FETCH_INTERVAL = 300000; // 5 minutes (300,000 ms)

function formatBytesToGB(bytes: number): string {
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
}

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<SystemStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [uptime, setUptime] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 로컬 스토리지에서 과거 기록 로드
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse system stats history", e);
      }
    }
  }, []);

  const fetchStats = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const data = await adminApi.getSystemStats();
      setStats(data);

      // 타임라인 데이터 기록 누적
      const nowStr = new Date().toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      const newItem: HistoryItem = {
        time: nowStr,
        cpu: Number(data.cpu.percent.toFixed(1)),
        memory: Number(data.memory.percent.toFixed(1)),
      };

      setHistory((prev) => {
        // Prevent duplicate entries within the exact same second (e.g. from React 18 Strict Mode double effect)
        if (prev.length > 0 && prev[prev.length - 1].time === newItem.time) {
          return prev;
        }
        const next = [...prev, newItem].slice(-MAX_HISTORY_LEN);
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "리소스 조회 실패",
        description: err.response?.data?.detail || "서버 리소스 정보를 가져오는데 실패했습니다.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 초기 로드 및 5분 주기 폴링
  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => {
      fetchStats(true);
    }, FETCH_INTERVAL);

    return () => {
      clearInterval(interval);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Uptime 실시간 타이머 계산 (부팅 시각 기준)
  useEffect(() => {
    if (!stats?.boot_time) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const updateUptime = () => {
      const boot = new Date(stats.boot_time).getTime();
      const now = new Date().getTime();
      const diffMs = now - boot;

      if (diffMs < 0) {
        setUptime("정보 확인 중");
        return;
      }

      const diffSecs = Math.floor(diffMs / 1000);
      const days = Math.floor(diffSecs / 86400);
      const hours = Math.floor((diffSecs % 86400) / 3600);
      const mins = Math.floor((diffSecs % 3600) / 60);
      const secs = diffSecs % 60;

      let timeStr = "";
      if (days > 0) timeStr += `${days}일 `;
      if (days > 0 || hours > 0) timeStr += `${hours}시간 `;
      timeStr += `${mins}분 ${secs}초`;

      setUptime(timeStr);
    };

    updateUptime();
    timerRef.current = setInterval(updateUptime, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stats]);

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-sm font-medium">서버 리소스 분석 중...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-muted/20 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b mobile-safe-area-pt">
        <div className="flex items-center justify-between p-4 max-w-[480px] md:max-w-2xl lg:max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h1 className="font-display text-xl font-bold">서버 모니터링 대시보드</h1>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            className="rounded-full gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>수동 갱신</span>
          </Button>
        </div>
      </header>

      <div className="max-w-[480px] md:max-w-2xl lg:max-w-4xl mx-auto p-4 space-y-6">
        {/* System Info Profile Card */}
        {stats && (
          <Card className="border shadow-md bg-gradient-to-br from-card to-secondary/10 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-6 -mt-6"></div>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                <Info className="w-4 h-4" />
                <span>System Profile</span>
              </div>
              <CardTitle className="text-xl font-bold mt-1">서버 인프라 기본 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-1">
                <div className="p-3.5 bg-background/50 border rounded-xl">
                  <span className="text-muted-foreground block text-xs font-medium">운영체제 (OS)</span>
                  <span className="font-semibold text-foreground mt-1 block truncate" title={stats.os}>{stats.os}</span>
                </div>
                <div className="p-3.5 bg-background/50 border rounded-xl">
                  <span className="text-muted-foreground block text-xs font-medium">CPU 코어 정보</span>
                  <span className="font-semibold text-foreground mt-1 block">{stats.cpu.cores} 논리 코어 (Cores)</span>
                </div>
                <div className="p-3.5 bg-background/50 border rounded-xl">
                  <span className="text-muted-foreground block text-xs font-medium">무중단 가동 시간 (Uptime)</span>
                  <span className="font-semibold text-primary mt-1 block font-mono">{uptime}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Real-time Usage Gauges */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CPU Load */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-primary" />
                  <span>CPU 사용량</span>
                </CardTitle>
                <CardDescription>최근 CPU 부하율</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-1 items-start">
                  <span className="text-3xl font-extrabold font-mono text-foreground">
                    {stats.cpu.percent.toFixed(1)}%
                  </span>
                </div>
                <Progress value={stats.cpu.percent} className="h-2.5" />
              </CardContent>
            </Card>

            {/* RAM Load */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  <span>메모리 (RAM) 용량</span>
                </CardTitle>
                <CardDescription>물리 메모리 점유율</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-1 items-start">
                  <span className="text-3xl font-extrabold font-mono text-foreground">
                    {stats.memory.percent.toFixed(1)}%
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {formatBytesToGB(stats.memory.used)} / {formatBytesToGB(stats.memory.total)}
                  </span>
                </div>
                <Progress value={stats.memory.percent} className="h-2.5" />
              </CardContent>
            </Card>

            {/* Disk Load */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-primary" />
                  <span>디스크 저장소 공간</span>
                </CardTitle>
                <CardDescription>메인 파일시스템 용량</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-1 items-start">
                  <span className="text-3xl font-extrabold font-mono text-foreground">
                    {stats.disk.percent.toFixed(1)}%
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {formatBytesToGB(stats.disk.used)} / {formatBytesToGB(stats.disk.total)}
                  </span>
                </div>
                <Progress value={stats.disk.percent} className="h-2.5" />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Resource Trend Timeline Chart */}
        <Card className="border shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-bold">인프라 리소스 추이 그래프</CardTitle>
            <CardDescription>
              지표는 5분주기로 갱신되며 최근 1시간 동안의 흐름을 보여줍니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {history.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center border border-dashed rounded-xl bg-muted/10">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">지표 데이터 수집 대기 중...</p>
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={history}
                    margin={{
                      top: 10,
                      right: 15,
                      left: -20,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 10 }}
                      stroke="#888888"
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 10 }}
                      stroke="#888888"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ fontSize: "11px", fontWeight: "bold" }}
                      itemStyle={{ fontSize: "12px" }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Line
                      type="monotone"
                      name="CPU 사용률 (%)"
                      dataKey="cpu"
                      stroke="hsl(220, 60%, 35%)"
                      strokeWidth={2.5}
                      activeDot={{ r: 6 }}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      name="메모리 사용률 (%)"
                      dataKey="memory"
                      stroke="hsl(142, 70%, 45%)"
                      strokeWidth={2.5}
                      activeDot={{ r: 6 }}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
