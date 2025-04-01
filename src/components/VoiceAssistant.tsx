
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface VoiceAssistantProps {
  onVoiceCommand: (command: string) => void;
}

const VoiceAssistant = ({ onVoiceCommand }: VoiceAssistantProps) => {
  const { toast } = useToast();
  
  useEffect(() => {
    // Add Vapi script to the document
    const script = document.createElement("script");
    script.src = "https://cdn.vapi.ai/widget.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    
    script.onload = () => {
      // Initialize Vapi when the script is loaded
      if (window.Vapi) {
        window.Vapi.init({
          clientId: "your-vapi-client-id", // Replace with actual client ID
          position: "bottom-right",
          assistant: {
            name: "Fridge Assistant",
            description: "Assistant for your Fridge Grocery List app",
            showAvatar: true,
          }
        });

        // Handle voice events
        window.addEventListener("vapi:message", (event: any) => {
          const message = event.detail?.message?.text;
          if (message) {
            onVoiceCommand(message);
          }
        });
      }
    };
    
    return () => {
      // Clean up on component unmount
      document.body.removeChild(script);
      window.removeEventListener("vapi:message", () => {});
    };
  }, [onVoiceCommand]);

  const handleActivateVoice = () => {
    if (window.Vapi) {
      window.Vapi.open();
      toast({
        title: "Voice Assistant Activated",
        description: "Speak to add items or create categories",
      });
    } else {
      toast({
        title: "Voice Assistant Not Available",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      onClick={handleActivateVoice}
      className="fixed bottom-6 right-6 rounded-full h-14 w-14 bg-grocery-primary hover:bg-grocery-primary/90 shadow-lg flex items-center justify-center"
      size="icon"
    >
      <Mic className="h-6 w-6" />
    </Button>
  );
};

// Add Vapi global type declaration
declare global {
  interface Window {
    Vapi: any;
  }
}

export default VoiceAssistant;
