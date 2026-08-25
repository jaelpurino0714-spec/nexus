"""
Chibi Robot Scientist - Sprite-Sheet Animation Engine in Python (Pygame-ce)
=============================================================================
Author: Expert Python Graphics Programmer
Requirements: pygame-ce, Pillow (for GIF & image extraction)

Description:
Loads and animates the 9 character poses extracted from the primary sprite sheet grid:
1. Running Forward (Speed trails & energy particles)
2. Jump Burst (Super jump upwards with starburst glow)
3. Walking & Thumbs Up (Matching Image 1 reference pose with weightless float)
4. Reading Science Book (Seated reading with floating lightbulb pulse)
5. Pointing Atom (Pointing at an orbiting illuminated 3D neon atom emblem)
6. Celebrating (Victory pose with falling neon confetti)
7. Hoverboard Surfing (Surfing on a glowing cyan speed ring)
8. Sprint Fast (Sprint pose with dust clouds & speed lines)
9. Meditating Lotus (Hovering in a pulsing cosmic purple aura)

Controls:
  [1-9]  : Switch active character animation pose
  [SPACE]: Toggle auto-cycle through all poses
  [G]    : Export seamless animated GIF ('mascot_animation.gif')
  [S]    : Save screenshot PNG ('mascot_screenshot.png')
  [ESC]  : Exit
"""

import math
import random
import sys
import os
import pygame
from PIL import Image

# Initialize Pygame
pygame.init()
pygame.font.init()

# Display Configuration
WIDTH, HEIGHT = 800, 950
FPS = 60
TITLE = "Chibi Robot Scientist - Sprite Animation Engine"
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption(TITLE)
clock = pygame.time.Clock()

# Color Palette Definitions
COLOR_BG_DARK = (6, 3, 16)
COLOR_BG_GRADIENT = (20, 10, 42)
COLOR_CYAN = (0, 225, 255)
COLOR_MAGENTA = (255, 0, 180)
COLOR_PURPLE = (145, 40, 255)
COLOR_YELLOW = (255, 220, 50)

# Paths
SPRITE_DIR = os.path.join(os.path.dirname(__file__), 'assets', 'mascot_sprites')

POSE_KEYS = [
    'pose_1_running',
    'pose_2_jumping',
    'pose_3_walking_thumbsup',
    'pose_4_reading',
    'pose_5_pointing_atom',
    'pose_6_celebrating',
    'pose_7_hoverboard',
    'pose_8_sprinting',
    'pose_9_meditating'
]

POSE_LABELS = [
    "1: Running Forward",
    "2: Jump Burst",
    "3: Walking & Thumbs Up",
    "4: Reading Science Book",
    "5: Chibi Robot Scientist (Primary GIF Mascot with Bubbling Test Tube)",
    "6: Victory Celebrating",
    "7: Hoverboard Surfing",
    "8: Sprinting Fast",
    "9: Meditating Lotus"
]

# --- Helper Functions ---

def load_sprite_textures():
    """Loads and returns high-resolution Pygame surfaces for all 9 character poses."""
    textures = {}
    for key in POSE_KEYS:
        path = os.path.join(SPRITE_DIR, f"{key}_transparent.png")
        if not os.path.exists(path):
            path = os.path.join(SPRITE_DIR, f"{key}.png")
        if os.path.exists(path):
            surf = pygame.image.load(path).convert_alpha()
            # Scale to high quality display dimensions (approx 360x400)
            scaled = pygame.transform.smoothscale(surf, (360, 400))
            textures[key] = scaled
        else:
            print(f"[Warning] Sprite file not found: {path}")
    return textures

# --- Particle Systems ---

class ConfettiParticle:
    """Falling colorful confetti for celebrating pose."""
    def __init__(self):
        self.reset()

    def reset(self):
        self.x = random.randint(50, WIDTH - 50)
        self.y = random.randint(-100, 0)
        self.vy = random.uniform(2.0, 5.0)
        self.vx = random.uniform(-1.5, 1.5)
        self.size = random.randint(6, 12)
        self.angle = random.uniform(0, 360)
        self.rot_speed = random.uniform(-6, 6)
        self.color = random.choice([COLOR_CYAN, COLOR_MAGENTA, COLOR_PURPLE, COLOR_YELLOW])

    def update(self):
        self.y += self.vy
        self.x += self.vx
        self.angle += self.rot_speed
        if self.y > HEIGHT:
            self.reset()

    def draw(self, surface):
        p_surf = pygame.Surface((self.size, self.size), pygame.SRCALPHA)
        p_surf.fill(self.color)
        rot_surf = pygame.transform.rotate(p_surf, self.angle)
        surface.blit(rot_surf, rot_surf.get_rect(center=(int(self.x), int(self.y))))

class AuraParticle:
    """Orbiting glowing energy particle for meditating / pointing atom pose."""
    def __init__(self):
        self.radius = random.uniform(140, 220)
        self.angle = random.uniform(0, math.pi * 2)
        self.speed = random.uniform(0.02, 0.05)
        self.size = random.uniform(3.0, 7.0)
        self.color = random.choice([COLOR_CYAN, COLOR_MAGENTA, COLOR_PURPLE])

    def update(self):
        self.angle += self.speed

    def draw(self, surface, cx, cy):
        px = cx + math.cos(self.angle) * self.radius
        py = cy + math.sin(self.angle) * (self.radius * 0.4)
        alpha = int(180 + 75 * math.sin(self.angle * 3))
        p_surf = pygame.Surface((20, 20), pygame.SRCALPHA)
        pygame.draw.circle(p_surf, (*self.color, alpha // 3), (10, 10), int(self.size * 2))
        pygame.draw.circle(p_surf, (255, 255, 255, alpha), (10, 10), int(self.size))
        surface.blit(p_surf, (int(px - 10), int(py - 10)))

# --- Main Animation Controller ---

class MascotAnimator:
    """Manages sprite pose rendering, physics, and particle overlays."""
    def __init__(self):
        self.textures = load_sprite_textures()
        self.active_index = 4  # Default to Pose 5 (Chibi Robot Scientist with Bubbling Test Tube & Tablet)
        self.auto_cycle = False
        self.last_cycle_time = 0.0
        self.confetti = [ConfettiParticle() for _ in range(50)]
        self.aura_particles = [AuraParticle() for _ in range(40)]

    def set_pose(self, index):
        self.active_index = index % len(POSE_KEYS)

    def next_pose(self):
        self.active_index = (self.active_index + 1) % len(POSE_KEYS)

    def render(self, surface, time_sec):
        # Auto cycle logic
        if self.auto_cycle and (time_sec - self.last_cycle_time > 3.0):
            self.next_pose()
            self.last_cycle_time = time_sec

        active_key = POSE_KEYS[self.active_index]
        tex = self.textures.get(active_key)
        
        cx, cy = WIDTH // 2, HEIGHT // 2

        # --- Pose-Specific Motion & Aura Effects ---
        float_y = math.sin(time_sec * 2.6) * 16.0
        tilt_deg = math.sin(time_sec * 2.6) * 3.0
        scale_mod = 1.0

        if self.active_index == 1:  # Jump Burst
            float_y = -abs(math.sin(time_sec * 3.5)) * 35.0
            scale_mod = 1.0 + abs(math.sin(time_sec * 3.5)) * 0.05
        elif self.active_index == 6:  # Hoverboard Surfing
            float_y = math.sin(time_sec * 4.0) * 12.0
            tilt_deg = -12.0 + math.sin(time_sec * 3.0) * 6.0
        elif self.active_index == 8:  # Meditating Lotus
            float_y = math.sin(time_sec * 1.8) * 10.0
            tilt_deg = 0.0

        # Background Radial Glow Aura
        glow_color = COLOR_MAGENTA if self.active_index in [5, 8] else COLOR_CYAN
        bg_glow = pygame.Surface((540, 540), pygame.SRCALPHA)
        for r_curr in range(250, 40, -12):
            a = int(65 * ((1.0 - (r_curr - 40) / 210) ** 2))
            pygame.draw.circle(bg_glow, (*glow_color, a), (270, 270), r_curr)
        surface.blit(bg_glow, (cx - 270, cy - 230 + int(float_y)))

        # Render Particles
        if self.active_index == 5:  # Celebrating Confetti
            for c in self.confetti:
                c.update()
                c.draw(surface)
        elif self.active_index in [4, 8]:  # Pointing Atom & Meditating Aura
            for p in self.aura_particles:
                p.update()
                p.draw(surface, cx, cy + int(float_y) + 40)

        # Draw Character Sprite
        if tex:
            # Apply scaling or rotation
            cur_tex = tex
            if scale_mod != 1.0:
                nw = int(360 * scale_mod)
                nh = int(400 * scale_mod)
                cur_tex = pygame.transform.smoothscale(tex, (nw, nh))

            rot_tex = pygame.transform.rotate(cur_tex, tilt_deg)
            rect = rot_tex.get_rect(center=(cx, int(cy + float_y)))
            surface.blit(rot_tex, rect)

# --- GIF Exporter Utility ---

def export_looping_gif(animator, duration_sec=3.0, fps=25, output_path="mascot_animation.gif"):
    """Exports a seamless looping animated GIF of the current active pose."""
    print(f"[GIF Exporter] Rendering {int(duration_sec * fps)} frames for seamless loop...")
    frames = []
    total_frames = int(duration_sec * fps)
    
    temp_surf = pygame.Surface((WIDTH, HEIGHT))
    
    for frame_idx in range(total_frames):
        t = (frame_idx / total_frames) * duration_sec
        
        temp_surf.fill(COLOR_BG_DARK)
        grad_surf = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
        for y in range(0, HEIGHT, 4):
            factor = y / HEIGHT
            r = int(COLOR_BG_DARK[0] * (1 - factor) + COLOR_BG_GRADIENT[0] * factor)
            g = int(COLOR_BG_DARK[1] * (1 - factor) + COLOR_BG_GRADIENT[1] * factor)
            b = int(COLOR_BG_DARK[2] * (1 - factor) + COLOR_BG_GRADIENT[2] * factor)
            pygame.draw.rect(grad_surf, (r, g, b, 120), (0, y, WIDTH, 4))
        temp_surf.blit(grad_surf, (0, 0))
        
        animator.render(temp_surf, t)
        
        raw_data = pygame.image.tostring(temp_surf, "RGB")
        pil_img = Image.frombytes("RGB", (WIDTH, HEIGHT), raw_data)
        pil_img = pil_img.resize((WIDTH // 2, HEIGHT // 2), Image.Resampling.LANCZOS)
        frames.append(pil_img)
        
    frames[0].save(
        output_path,
        save_all=True,
        append_images=frames[1:],
        duration=int(1000 / fps),
        loop=0
    )
    print(f"[GIF Exporter] Saved seamless animation to '{output_path}'!")

# --- Main Window Loop ---

def main():
    animator = MascotAnimator()
    running = True
    paused = False
    paused_time = 0
    font = pygame.font.SysFont("Consolas", 15)
    font_bold = pygame.font.SysFont("Consolas", 18, bold=True)
    
    print("=" * 65)
    print(" CHIBI ROBOT SCIENTIST - SPRITE ANIMATION ENGINE")
    print("=" * 65)
    print(" Controls:")
    print("   [1-9]   : Select Pose 1 to 9")
    print("   [SPACE] : Toggle Auto-Cycle Mode")
    print("   [S]     : Save Screenshot PNG ('mascot_screenshot.png')")
    print("   [G]     : Export Animated GIF ('mascot_animation.gif')")
    print("   [ESC]   : Exit")
    print("=" * 65)

    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    running = False
                elif event.key == pygame.K_SPACE:
                    animator.auto_cycle = not animator.auto_cycle
                elif pygame.K_1 <= event.key <= pygame.K_9:
                    idx = event.key - pygame.K_1
                    animator.set_pose(idx)
                elif event.key == pygame.K_s:
                    filename = "mascot_screenshot.png"
                    pygame.image.save(screen, filename)
                    print(f"[Screenshot] Saved to '{filename}'")
                elif event.key == pygame.K_g:
                    export_looping_gif(animator)

        if not paused:
            current_ticks = pygame.time.get_ticks() - paused_time
            time_sec = current_ticks / 1000.0
        
        # Render background gradient
        screen.fill(COLOR_BG_DARK)
        grad_surf = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
        for y in range(0, HEIGHT, 4):
            factor = y / HEIGHT
            r = int(COLOR_BG_DARK[0] * (1 - factor) + COLOR_BG_GRADIENT[0] * factor)
            g = int(COLOR_BG_DARK[1] * (1 - factor) + COLOR_BG_GRADIENT[1] * factor)
            b = int(COLOR_BG_DARK[2] * (1 - factor) + COLOR_BG_GRADIENT[2] * factor)
            pygame.draw.rect(grad_surf, (r, g, b, 120), (0, y, WIDTH, 4))
        screen.blit(grad_surf, (0, 0))

        # Render Active Sprite Animation
        animator.render(screen, time_sec)

        # UI Info Header
        label_str = POSE_LABELS[animator.active_index]
        cycle_str = "AUTO-CYCLE: ON" if animator.auto_cycle else "AUTO-CYCLE: OFF"
        
        lbl_text = font_bold.render(f"ACTIVE POSE: {label_str} | {cycle_str}", True, (0, 225, 255))
        screen.blit(lbl_text, (20, 25))

        fps_text = font.render(f"FPS: {int(clock.get_fps())} | Controls: [1-9] Poses | [SPACE] Auto-Cycle | [S] PNG | [G] GIF", True, (180, 180, 220))
        screen.blit(fps_text, (20, HEIGHT - 30))

        pygame.display.flip()
        clock.tick(FPS)

    pygame.quit()

if __name__ == "__main__":
    main()
