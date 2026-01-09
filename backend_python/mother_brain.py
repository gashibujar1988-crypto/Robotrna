
import os
import asyncio
from dotenv import load_dotenv

# Import the new Hive Mind Core
from core.high_council import HighCouncil
from agents.agent_registry import get_agent_profile

# Load environment variables
load_dotenv("python_secrets.env")

class MotherBrain:
    def __init__(self):
        # Initialize the 5-Brain High Council
        self.council = HighCouncil()
        print("Mother Brain 2.0 (High Council) Initialized. Dual-Brain System Active.")

    async def process_task(self, user_input: str, agent_name: str = "Mother", log_callback=None):
        """
        The Thinking Process:
        1. If Agent is 'Mother' -> Consult the High Council (5 steps).
        2. If Agent is a Sub-Agent -> Retrieve Profile & Execute directly.
        """
        from core.status_broadcaster import broadcaster
        from core.tool_registry import execute_tool

        async def log(msg):
            if log_callback: 
                await log_callback(msg)
            else:
                print(f"[LOG] {msg}")

        try:
            # Broadcast Intent: Agent is now ACTIVE
            await broadcaster.broadcast_agent_status(agent_name, "WORKING")

            # --- SCENARIO A: MOTHER (High Level Orchestration) ---
            if agent_name == "Mother":
                # Mother uses the High Council to think deeply
                response = await self.council.execute_council(user_input, log_callback)
                # finished
                await broadcaster.broadcast_agent_status(agent_name, "IDLE")
                return response

            # --- SCENARIO B: SUB-AGENT (Specific Task) ---
            else:
                # 1. Provide Visual Feedback
                await log(f"[{agent_name}] -> 🧠 Uploading neural context...")
                
                # 2. Get Agent DNA
                profile = get_agent_profile(agent_name)
                role = profile.get("role", "Assistant")
                base_prompt = profile.get("system_prompt", "You are a helpful assistant.")
                tools = profile.get("tools", [])

                await log(f"[{agent_name}] -> Role: {role} | Active Tools: {tools}")

                # 3. Construct Tool-Aware Prompt
                system_prompt = f"""
                {base_prompt}
                
                YOU HAVE ACCESS TO THESE TOOLS: {tools}
                
                INSTRUCTIONS:
                - If you can answer directly, do so.
                - If you need to use a tool, output EXACTLY this format:
                  ACTION: tool_name
                  INPUT: the input for the tool
                
                Example:
                ACTION: google_search
                INPUT: tesla stock price
                """

                # 4. First Think (Decide to use tool or not)
                response = await self.council.brain.think(
                    prompt=f"{system_prompt}\n\nUSER TASK: {user_input}", 
                    role=agent_name, 
                    preferred_model="openai" # Switch to OpenAI
                )
                
                # 5. Check for Action
                if "ACTION:" in response and "INPUT:" in response:
                    # Parse Action
                    lines = response.split('\n')
                    tool_name = next((l.split("ACTION:")[1].strip() for l in lines if "ACTION:" in l), None)
                    tool_input = next((l.split("INPUT:")[1].strip() for l in lines if "INPUT:" in l), None)
                    
                    if tool_name and tool_input:
                        await log(f"[{agent_name}] -> 🛠️ Executing Tool: {tool_name}...")
                        
                        # Execute Tool
                        tool_result = execute_tool(tool_name, tool_input)
                        await log(f"[{agent_name}] -> Tool Output: {tool_result}")
                        
                        # Final Synthesis
                        final_prompt = f"Original Task: {user_input}\nTool Result: {tool_result}\n\nGive a final answer to the user."
                        response = await self.council.brain.think(final_prompt, role=agent_name, preferred_model="openai")

                await log(f"[{agent_name}] -> Task Complete.")
                await broadcaster.broadcast_agent_status(agent_name, "IDLE")
                return response

        except Exception as e:
            error_msg = f"CRITICAL CORTEX FAILURE: {str(e)}"
            await log(f"[{agent_name}] -> 🔴 {error_msg}")
            await broadcaster.broadcast_agent_status(agent_name, "ERROR")
            return "I apologize. My neural link was severed. Please check the backend logs."
