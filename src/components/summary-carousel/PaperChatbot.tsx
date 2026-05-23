import { useState } from "react";
import { Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PaperChatbot() {
  const [input, setInput] = useState("");
  
  // Dummy messages for layout testing
  const [messages, setMessages] = useState([
    { id: 1, role: "assistant", content: "안녕하세요! 이 논문에 대해 궁금한 점이 있으신가요? 논문의 핵심 요약이나 어려운 수식, 특정 문단에 대해 질문해 보세요." },
    { id: 2, role: "user", content: "이 논문의 주요 기여(Contribution)가 뭐야?" },
    { id: 3, role: "assistant", content: "이 논문의 주요 기여는 다음과 같습니다.\n1. 새로운 아키텍처 제안을 통해 기존 모델 대비 연산량을 30% 감소시켰습니다.\n2. 제안된 방법론을 검증하기 위한 대규모 벤치마크 데이터셋을 구축했습니다." },
  ]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages([...messages, { id: Date.now(), role: "user", content: input }]);
    setInput("");
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [
        ...prev, 
        { id: Date.now() + 1, role: "assistant", content: "아직 프로토타입 UI 레이아웃 상태입니다! 추후 실제 API와 연동될 예정입니다." }
      ]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full w-full bg-background border rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b bg-muted/30">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">논문 AI 어시스턴트</h3>
          <p className="text-xs text-muted-foreground">Moonlight 스타일 챗봇</p>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-secondary' : 'bg-primary/10'}`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-primary" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
              msg.role === 'user' 
                ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                : 'bg-muted rounded-tl-sm'
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-background">
        <div className="flex items-end gap-2 bg-muted/50 border rounded-2xl p-2 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
          <textarea
            className="flex-1 max-h-32 min-h-[44px] bg-transparent border-0 focus:ring-0 resize-none px-3 py-2.5 text-sm"
            placeholder="논문에 대해 질문해보세요..."
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button 
            size="icon" 
            className="rounded-xl h-11 w-11 shrink-0 mb-0.5" 
            onClick={handleSend}
            disabled={!input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-center mt-2">
          <p className="text-[10px] text-muted-foreground">AI는 실수를 할 수 있습니다. 중요한 정보는 논문 원문을 확인하세요.</p>
        </div>
      </div>
    </div>
  );
}
