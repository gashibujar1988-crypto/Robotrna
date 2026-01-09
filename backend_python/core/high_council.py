
import os
import google.generativeai as genai
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv("python_secrets.env")

class DualBrain:
    """
    Manages connections to both Gemini (Google) and GPT-4 (OpenAI).
    Acts as the 'Hardware Layer' for the High Council.
    """
    def __init__(self):
        # 1. Setup Gemini (Primary/Architect)
        self.gemini_key = os.getenv("GOOGLE_API_KEY")
        if self.gemini_key:
            genai.configure(api_key=self.gemini_key)
            try:
                # Robust Model Selection
                available = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
                print(f"[DualBrain] Available Gemini Models: {available}")
                
                # Preferred Order (Fall back to stable 'gemini-pro' first to fix 404)
                priorities = ['models/gemini-pro', 'gemini-pro', 'models/gemini-1.5-flash']
                # FORCE STABLE MODEL for now
                selected = 'models/gemini-pro'
                # selected = next((p for p in priorities if p in available), 'models/gemini-pro')
                
                print(f"[DualBrain] Selected Gemini Model: {selected}")
                self.gemini_model = genai.GenerativeModel(selected)
            except Exception as e:
                print(f"[DualBrain] Error listing models: {e}. Defaulting to gemini-pro.")
                self.gemini_model = genai.GenerativeModel('gemini-pro')
        else:
            print("CRITICAL: No GOOGLE_API_KEY found.")

        # 2. Setup OpenAI (Researcher/Critic)
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.openai_client = None
        if self.openai_key:
            try:
                self.openai_client = OpenAI(api_key=self.openai_key)
                print("DualBrain: OpenAI Connected (GPT-4o Ready)")
            except Exception as e:
                print(f"DualBrain: OpenAI Error: {e}")
        else:
            print("DualBrain: No OPENAI_API_KEY. Running in Single-Brain Mode (Gemini Only).")

    async def think(self, prompt: str, role: str = "Assistant", preferred_model: str = "auto"):
        """
        Routes the thought to the best available brain.
        """
        # LOGIC: 
        # - Architect/Synthesizer -> Gemini 1.5 Pro (Large Context)
        # - Researcher/Critic -> GPT-4o (Precision)
        
        # For Prototype: simple routing
        params = {"role": role, "prompt": prompt}
        
        if preferred_model == "openai" and self.openai_client:
            return self._ask_openai(role, prompt)
        
        # Default to Gemini
        return self._ask_gemini(role, prompt)

    def _ask_gemini(self, role, prompt):
        try:
            # System prompt trick for Gemini
            full_prompt = f"ROLE: {role}\n\nTASK: {prompt}"
            response = self.gemini_model.generate_content(full_prompt)
            return response.text
        except Exception as e:
            return f"Gemini Error: {e}"

    def _ask_openai(self, role, prompt):
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4o", # Or gpt-3.5-turbo if 4o unavailable
                messages=[
                    {"role": "system", "content": f"You are {role}."},
                    {"role": "user", "content": prompt}
                ]
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI Failed, falling back to Gemini: {e}")
            return self._ask_gemini(role, prompt)

class HighCouncil:
    """
    The 5-Step Thinking Process.
    """
    def __init__(self):
        self.brain = DualBrain()

    async def execute_council(self, user_request: str, log_callback=None):
        """
        Runs the 5-step High Council process.
        """
        async def log(msg):
            if log_callback: await log_callback(msg)

        # 1. THE ARCHITECT (Gemini)
        await log("[High_Council] -> 🏛️ The Architect is planning...")
        plan_prompt = f"Analyze this request: '{user_request}'. Break it down into 3 clear steps for the Hive Mind."
        plan = await self.brain.think(plan_prompt, role="The Architect", preferred_model="gemini")
        # await log(f"[Architect] -> Plan: {plan[:100]}...")

        # 2. THE RESEARCHER (GPT-4)
        await log("[High_Council] -> 🔬 The Researcher is gathering facts...")
        research_prompt = f"Based on this plan: {plan}\n\nIdentify what KEY FACTS we need to answer this. (Simulated search for now)."
        facts = await self.brain.think(research_prompt, role="The Researcher", preferred_model="openai")

        # 3. THE CRITIC (GPT-4)
        await log("[High_Council] -> ⚖️ The Critic is reviewing...")
        critic_prompt = f"Review this plan and these facts: {plan} + {facts}. Are we missing anything critical? Be brief."
        critique = await self.brain.think(critic_prompt, role="The Critic", preferred_model="openai")

        # 4. THE SYNTHESIZER (Gemini)
        await log("[High_Council] -> 🔗 The Synthesizer is merging results...")
        synth_prompt = f"Synthesize everything into a final instruction for the Agents:\nRequest: {user_request}\nPlan: {plan}\nCritique: {critique}"
        final_strategy = await self.brain.think(synth_prompt, role="The Synthesizer", preferred_model="gemini")
        
        return final_strategy
