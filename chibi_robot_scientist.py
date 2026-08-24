"""
Chibi Robot Scientist - High-Quality Procedural Animated Character in Python (Pygame-ce)
==========================================================================================
Author: Expert Python Graphics Programmer
Requirements: pygame-ce, Pillow (optional for GIF export)

Description:
Procedurally renders a cute, high-detail 3D-styled Chibi Robot Scientist with a 5-second
seamless looping idle floating animation and realistic secondary motion physics:
- Weightless vertical float with smooth ease-in-out at peak and valley
- Subtle horizontal body sway and 3D rotational tilt
- Delayed secondary arm/object inertia (test tube and tech tablet lag behind body float)
- Leg/feet swinging momentum following body movement
- Flaring lab coat flaps and soft hair dynamics
- Automatic eye blink and vapor steam particles rising from liquid
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
LOOP_DURATION = 5.0  # 5-second seamless loop duration
TITLE = "Chibi Robot Scientist - Floating Idle Animation"
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption(TITLE)
clock = pygame.time.Clock()

# Color Palette Definitions
COLOR_BG_DARK = (6, 3, 16)
COLOR_BG_GRADIENT = (20, 10, 42)
COLOR_WHITE = (245, 248, 255)
COLOR_COAT_SHADOW = (175, 185, 215)
COLOR_SUIT_DARK = (16, 14, 28)
COLOR_BELT = (28, 24, 45)

# Neon Glow Palette
COLOR_CYAN = (0, 225, 255)
COLOR_CYAN_GLOW = (0, 200, 255, 120)
COLOR_MAGENTA = (255, 0, 180)
COLOR_MAGENTA_GLOW = (255, 0, 180, 120)
COLOR_PURPLE = (145, 40, 255)
COLOR_PINK_CHEEK = (255, 90, 165, 180)
COLOR_EYE_PURPLE_DARK = (55, 8, 95)
COLOR_EYE_PURPLE_MID = (165, 45, 240)
COLOR_EYE_PURPLE_LIGHT = (230, 150, 255)

def draw_atom_symbol(surface, center, radius, primary_color, orbit_angle=0.0, alpha=255):
    """Draws an illuminated neon atomic symbol (nucleus + 3 orbiting ellipses + electrons)."""
    cx, cy = center
    
    glow_surf = pygame.Surface((radius * 3.4, radius * 3.4), pygame.SRCALPHA)
    gcx, gcy = radius * 1.7, radius * 1.7
    
    # Nucleus core glow
    pygame.draw.circle(glow_surf, (*primary_color, int(alpha * 0.4)), (int(gcx), int(gcy)), int(radius * 0.45))
    pygame.draw.circle(glow_surf, (*primary_color, alpha), (int(gcx), int(gcy)), int(radius * 0.25))
    pygame.draw.circle(glow_surf, (255, 255, 255, alpha), (int(gcx), int(gcy)), int(radius * 0.12))
    
    # 3 Orbiting ellipses
    for i in range(3):
        angle = orbit_angle + (i * math.pi / 3.0)
        orbit_w, orbit_h = int(radius * 2.2), int(radius * 0.85)
        
        orbit_surf = pygame.Surface((orbit_w * 2, orbit_w * 2), pygame.SRCALPHA)
        ocx, ocy = orbit_w, orbit_w
        
        rect = pygame.Rect(ocx - orbit_w // 2, ocy - orbit_h // 2, orbit_w, orbit_h)
        pygame.draw.ellipse(orbit_surf, (*primary_color, int(alpha * 0.4)), rect.inflate(4, 4), 5)
        pygame.draw.ellipse(orbit_surf, (*primary_color, alpha), rect, 3)
        
        # Electron dot
        e_pos_x = ocx + (orbit_w // 2) * math.cos(orbit_angle * 2.5 + i * 2.1)
        e_pos_y = ocy + (orbit_h // 2) * math.sin(orbit_angle * 2.5 + i * 2.1)
        pygame.draw.circle(orbit_surf, (*primary_color, int(alpha * 0.5)), (int(e_pos_x), int(e_pos_y)), 5)
        pygame.draw.circle(orbit_surf, (255, 255, 255, alpha), (int(e_pos_x), int(e_pos_y)), 3)
        
        rotated_surf = pygame.transform.rotate(orbit_surf, math.degrees(angle))
        rot_rect = rotated_surf.get_rect(center=(gcx, gcy))
        glow_surf.blit(rotated_surf, rot_rect)
        
    surface.blit(glow_surf, (cx - gcx, cy - gcy))

# --- Particle Systems ---

class VaporParticle:
    """Rising steam/smoke particle from test tube with swirling physics and cyan-magenta glow."""
    def __init__(self, start_x, start_y):
        self.reset(start_x, start_y)

    def reset(self, start_x, start_y):
        self.x = start_x + random.uniform(-3, 3)
        self.y = start_y
        self.vx = random.uniform(-0.6, 0.6)
        self.vy = random.uniform(-2.6, -1.5)
        self.radius = random.uniform(5.0, 12.0)
        self.max_life = random.uniform(55, 95)
        self.life = self.max_life
        self.wobble_freq = random.uniform(0.08, 0.16)
        self.wobble_amp = random.uniform(1.4, 2.6)
        self.phase = random.uniform(0, math.pi * 2)

    def update(self):
        self.life -= 1
        self.y += self.vy
        self.x += self.vx + math.sin(self.life * self.wobble_freq + self.phase) * self.wobble_amp
        self.radius += 0.16

    def draw(self, surface):
        if self.life <= 0:
            return
        progress = 1.0 - (self.life / self.max_life)
        alpha = int(210 * math.sin(progress * math.pi))
        
        if progress < 0.45:
            t = progress / 0.45
            r = int(COLOR_CYAN[0] * (1 - t) + COLOR_MAGENTA[0] * t)
            g = int(COLOR_CYAN[1] * (1 - t) + COLOR_MAGENTA[1] * t)
            b = int(COLOR_CYAN[2] * (1 - t) + COLOR_MAGENTA[2] * t)
        else:
            t = (progress - 0.45) / 0.55
            r = int(COLOR_MAGENTA[0] * (1 - t) + COLOR_PURPLE[0] * t)
            g = int(COLOR_MAGENTA[1] * (1 - t) + COLOR_PURPLE[1] * t)
            b = int(COLOR_MAGENTA[2] * (1 - t) + COLOR_PURPLE[2] * t)

        pr = int(self.radius)
        p_surf = pygame.Surface((pr * 4, pr * 4), pygame.SRCALPHA)
        pygame.draw.circle(p_surf, (r, g, b, alpha // 3), (pr * 2, pr * 2), pr * 2)
        pygame.draw.circle(p_surf, (r, g, b, alpha // 2), (pr * 2, pr * 2), int(pr * 1.3))
        pygame.draw.circle(p_surf, (255, 255, 255, alpha), (pr * 2, pr * 2), max(1, pr // 3))
        surface.blit(p_surf, (int(self.x - pr * 2), int(self.y - pr * 2)))

class StarParticle:
    """Drifting space dust / sparkling stars."""
    def __init__(self):
        self.x = random.randint(0, WIDTH)
        self.y = random.randint(0, HEIGHT)
        self.radius = random.uniform(1.2, 3.5)
        self.speed = random.uniform(0.2, 0.7)
        self.alpha_phase = random.uniform(0, math.pi * 2)
        self.is_magenta = random.random() > 0.5

    def update(self):
        self.y -= self.speed
        if self.y < 0:
            self.y = HEIGHT
            self.x = random.randint(0, WIDTH)

    def draw(self, surface, time_sec):
        alpha = int(130 + 110 * math.sin(time_sec * 2.8 + self.alpha_phase))
        color = COLOR_MAGENTA if self.is_magenta else COLOR_CYAN
        s_surf = pygame.Surface((16, 16), pygame.SRCALPHA)
        pygame.draw.circle(s_surf, (*color, alpha // 4), (8, 8), int(self.radius * 2.5))
        pygame.draw.circle(s_surf, (255, 255, 255, alpha), (8, 8), int(self.radius))
        surface.blit(s_surf, (int(self.x - 8), int(self.y - 8)))

# --- Chibi Character Renderer ---

class ChibiRobotScientist:
    """High-quality procedural renderer for the Chibi Robot Scientist with 5s floating idle animation."""
    def __init__(self, center_x, center_y):
        self.cx = center_x
        self.cy = center_y
        self.vapor_particles = [VaporParticle(0, 0) for _ in range(45)]
        self.stars = [StarParticle() for _ in range(70)]

    def draw_organic_hair(self, surface, x, y, hair_tilt=0.0):
        """Renders organic curved hair tufts with soft vertical compression and tilt."""
        hair_x = x - 10
        hair_y = y - 165
        
        # Back Pink Layer
        pink_surf = pygame.Surface((160, 140), pygame.SRCALPHA)
        pygame.draw.ellipse(pink_surf, COLOR_MAGENTA, (20, 20, 120, 90))
        pygame.draw.circle(pink_surf, COLOR_MAGENTA, (110, 45), 35)
        surface.blit(pygame.transform.rotate(pink_surf, -22 + hair_tilt), (hair_x + 10, hair_y - 45))

        # Middle Purple Layer
        purple_surf = pygame.Surface((170, 150), pygame.SRCALPHA)
        pygame.draw.ellipse(purple_surf, COLOR_PURPLE, (15, 25, 130, 95))
        pygame.draw.circle(purple_surf, COLOR_PURPLE, (75, 40), 45)
        surface.blit(pygame.transform.rotate(purple_surf, -12 + hair_tilt), (hair_x - 30, hair_y - 50))

        # Front Cyan Swept Crest
        cyan_surf = pygame.Surface((180, 160), pygame.SRCALPHA)
        pygame.draw.ellipse(cyan_surf, COLOR_CYAN, (10, 30, 140, 100))
        pygame.draw.circle(cyan_surf, COLOR_CYAN, (45, 50), 50)
        surface.blit(pygame.transform.rotate(cyan_surf, 8 + hair_tilt), (hair_x - 85, hair_y - 45))

        # Shiny Specular Hair Highlight
        hi_surf = pygame.Surface((120, 60), pygame.SRCALPHA)
        pygame.draw.ellipse(hi_surf, (255, 255, 255, 160), (10, 10, 100, 35))
        surface.blit(pygame.transform.rotate(hi_surf, -15 + hair_tilt), (hair_x - 45, hair_y - 35))

    def draw_head(self, surface, x, y, blink_factor, time_sec, hair_tilt=0.0):
        """Draws helmet, visor, glossy eyes, cheek blush, ear cups & hair crest."""
        
        # Helmet shadow glow
        h_shadow = pygame.Surface((340, 290), pygame.SRCALPHA)
        pygame.draw.ellipse(h_shadow, (0, 0, 0, 80), (10, 10, 320, 270))
        surface.blit(h_shadow, (x - 170, y - 175))

        # 1. Main White Helmet Base
        helmet_rect = pygame.Rect(x - 148, y - 160, 296, 235)
        pygame.draw.ellipse(surface, (230, 235, 248), helmet_rect)
        pygame.draw.ellipse(surface, (255, 255, 255), helmet_rect.inflate(-20, -20))

        # 2. Side Ear Cups (Headphones with Cyan/Magenta Glow Rings)
        for side in [-1, 1]:
            ear_x = x + side * 144
            ear_y = y - 32
            
            e_glow = pygame.Surface((90, 90), pygame.SRCALPHA)
            pygame.draw.circle(e_glow, (0, 225, 255, 90), (45, 45), 42)
            surface.blit(e_glow, (ear_x - 45, ear_y - 45))
            
            pygame.draw.circle(surface, (25, 20, 45), (ear_x, ear_y), 34)
            pygame.draw.circle(surface, COLOR_CYAN, (ear_x, ear_y), 30, 5)
            pygame.draw.circle(surface, COLOR_MAGENTA, (ear_x, ear_y), 18)
            pygame.draw.circle(surface, (255, 255, 255), (ear_x - 3 * side, ear_y - 4), 6)

        # 3. Visor Screen & Cyan Frame
        visor_rect = pygame.Rect(x - 120, y - 115, 240, 138)
        
        v_glow = pygame.Surface((280, 178), pygame.SRCALPHA)
        pygame.draw.ellipse(v_glow, (0, 225, 255, 130), (10, 10, 260, 158), 16)
        surface.blit(v_glow, (x - 140, y - 125))

        pygame.draw.ellipse(surface, COLOR_CYAN, visor_rect.inflate(14, 14))
        pygame.draw.ellipse(surface, (10, 8, 24), visor_rect)

        # Visor Glass Sheen Streak
        sheen_surf = pygame.Surface((240, 138), pygame.SRCALPHA)
        pygame.draw.polygon(sheen_surf, (255, 255, 255, 40), [
            (25, 10), (140, 10), (70, 60), (15, 60)
        ])
        surface.blit(sheen_surf, visor_rect.topleft)

        # 4. Glossy Anime Purple Eyes
        eye_h = max(4, int(76 * blink_factor))
        eye_y = y - 46 + int((1.0 - blink_factor) * 36)
        
        for side in [-1, 1]:
            eye_x = x + side * 52
            if eye_h > 6:
                aura = pygame.Surface((74, 94), pygame.SRCALPHA)
                pygame.draw.ellipse(aura, (170, 40, 255, 110), (0, 0, 74, 94))
                surface.blit(aura, (eye_x - 37, eye_y - 47))

                pupil_rect = pygame.Rect(eye_x - 27, eye_y - eye_h // 2, 54, eye_h)
                pygame.draw.ellipse(surface, COLOR_EYE_PURPLE_DARK, pupil_rect)
                
                inner_rect = pygame.Rect(eye_x - 22, eye_y - eye_h // 2 + 8, 44, max(4, eye_h - 14))
                pygame.draw.ellipse(surface, COLOR_EYE_PURPLE_MID, inner_rect)
                
                bottom_rect = pygame.Rect(eye_x - 17, eye_y + eye_h // 2 - 24, 34, max(2, 18))
                pygame.draw.ellipse(surface, COLOR_EYE_PURPLE_LIGHT, bottom_rect)
                
                pygame.draw.circle(surface, (255, 255, 255), (eye_x - 8 * side, eye_y - eye_h // 4), 10)
                pygame.draw.circle(surface, (255, 255, 255), (eye_x + 11 * side, eye_y + eye_h // 4), 5)
            else:
                pygame.draw.arc(surface, COLOR_PURPLE, (eye_x - 22, eye_y - 8, 44, 18), 0, math.pi, 4)

        # 5. Cheek Blush & Mouth
        if blink_factor > 0.35:
            for side in [-1, 1]:
                cheek_x = x + side * 86
                cheek_y = y - 14
                chk = pygame.Surface((38, 22), pygame.SRCALPHA)
                pygame.draw.ellipse(chk, COLOR_PINK_CHEEK, (0, 0, 38, 22))
                surface.blit(chk, (cheek_x - 19, cheek_y - 11))

            mouth_rect = pygame.Rect(x - 12, y - 18, 24, 16)
            pygame.draw.arc(surface, (255, 80, 140), mouth_rect, math.pi, 2 * math.pi, 3)
            pygame.draw.circle(surface, (255, 130, 170), (x, y - 7), 5)

        # 6. Render Hair
        self.draw_organic_hair(surface, x, y, hair_tilt)

    def draw_body_and_coat(self, surface, x, y, time_sec, leg_l_shift=(0, 0), leg_r_shift=(0, 0)):
        """Draws coat, torso, glowing chest atom emblem, belt, and swinging boots."""
        
        omega = 2.0 * math.pi / LOOP_DURATION
        sway_l = math.sin(omega * time_sec - 0.25) * 10.0
        sway_r = math.cos(omega * time_sec - 0.25) * 10.0
        
        # 1. Outer White Lab Coat Flaps
        coat_l = [
            (x - 45, y + 40), (x - 145 + sway_l, y + 170),
            (x - 90 + sway_l, y + 215), (x - 25, y + 130)
        ]
        coat_r = [
            (x + 45, y + 40), (x + 145 + sway_r, y + 170),
            (x + 90 + sway_r, y + 215), (x + 25, y + 130)
        ]
        
        pygame.draw.polygon(surface, (35, 18, 65), coat_l)
        pygame.draw.polygon(surface, (35, 18, 65), coat_r)
        
        pygame.draw.polygon(surface, COLOR_WHITE, [
            (x - 42, y + 36), (x - 140 + sway_l, y + 165),
            (x - 85 + sway_l, y + 205), (x - 22, y + 125)
        ])
        pygame.draw.polygon(surface, COLOR_WHITE, [
            (x + 42, y + 36), (x + 140 + sway_r, y + 165),
            (x + 85 + sway_r, y + 205), (x + 22, y + 125)
        ])

        # 2. Inner Suit & Chest
        torso_rect = pygame.Rect(x - 56, y + 38, 112, 108)
        pygame.draw.rect(surface, COLOR_SUIT_DARK, torso_rect, border_radius=16)
        
        pygame.draw.polygon(surface, COLOR_WHITE, [(x - 56, y + 38), (x - 22, y + 115), (x - 56, y + 115)])
        pygame.draw.polygon(surface, COLOR_WHITE, [(x + 56, y + 38), (x + 22, y + 115), (x + 56, y + 115)])

        # 3. Chest Atom Symbol (Glowing Neon Cyan)
        draw_atom_symbol(surface, (x, y + 76), 25, COLOR_CYAN, orbit_angle=time_sec * 1.6)

        # 4. Belt & Buckle
        pygame.draw.rect(surface, COLOR_BELT, (x - 54, y + 134, 108, 18), border_radius=4)
        b_rect = pygame.Rect(x - 18, y + 130, 36, 24)
        pygame.draw.rect(surface, COLOR_CYAN, b_rect, border_radius=6)
        pygame.draw.rect(surface, (255, 255, 255), b_rect.inflate(-6, -6), border_radius=4)

        # 5. Swinging Boots (Secondary Motion Inertia)
        # Left Leg (Side -1)
        lx = x - 32 + leg_l_shift[0]
        ly = y + 148 + leg_l_shift[1]
        pygame.draw.rect(surface, COLOR_SUIT_DARK, (lx - 16, ly, 32, 45), border_radius=8)
        boot_l = pygame.Rect(lx - 22, ly + 36, 44, 46)
        pygame.draw.rect(surface, COLOR_WHITE, boot_l, border_radius=12)
        pygame.draw.rect(surface, COLOR_PURPLE, (lx - 20, ly + 36, 40, 14), border_radius=6)
        pygame.draw.rect(surface, COLOR_CYAN, (lx - 22, ly + 74, 44, 8), border_radius=4)

        # Right Leg (Side 1)
        rx = x + 32 + leg_r_shift[0]
        ry = y + 148 + leg_r_shift[1]
        pygame.draw.rect(surface, COLOR_SUIT_DARK, (rx - 16, ry, 32, 45), border_radius=8)
        boot_r = pygame.Rect(rx - 22, ry + 36, 44, 46)
        pygame.draw.rect(surface, COLOR_WHITE, boot_r, border_radius=12)
        pygame.draw.rect(surface, COLOR_PURPLE, (rx - 20, ry + 36, 40, 14), border_radius=6)
        pygame.draw.rect(surface, COLOR_CYAN, (rx - 22, ry + 74, 44, 8), border_radius=4)

    def draw_right_arm_and_test_tube(surface_or_self, surface, x, y, time_sec, arm_y_lag=0.0):
        """Draws right hand holding test tube with delayed inertia lag."""
        self = surface_or_self
        arm_base_x, arm_base_y = x - 54, y + 54
        hand_x = x - 170
        hand_y = y - 15 + arm_y_lag  # Delayed secondary response
        
        pygame.draw.line(surface, COLOR_WHITE, (arm_base_x, arm_base_y), (hand_x, hand_y), 28)
        pygame.draw.circle(surface, COLOR_WHITE, (hand_x, hand_y), 16)
        pygame.draw.circle(surface, COLOR_WHITE, (hand_x - 6, hand_y - 2), 11)
        
        # Test tube
        tube_w, tube_h = 34, 110
        tube_x, tube_y = hand_x - 17, hand_y - 80
        
        g_tube = pygame.Surface((tube_w + 40, tube_h + 40), pygame.SRCALPHA)
        pygame.draw.rect(g_tube, (0, 225, 255, 95), (20, 20, tube_w, tube_h), border_radius=16)
        surface.blit(g_tube, (tube_x - 20, tube_y - 20))
        
        liquid_h = int(tube_h * 0.68)
        liq_rect = pygame.Rect(tube_x + 4, tube_y + tube_h - liquid_h, tube_w - 8, liquid_h - 4)
        
        liq_surf = pygame.Surface((tube_w - 8, liquid_h - 4), pygame.SRCALPHA)
        for ly in range(liquid_h - 4):
            factor = ly / max(1, liquid_h - 4)
            r = int(COLOR_CYAN[0] * (1 - factor) + COLOR_MAGENTA[0] * factor)
            g = int(COLOR_CYAN[1] * (1 - factor) + COLOR_MAGENTA[1] * factor)
            b = int(COLOR_CYAN[2] * (1 - factor) + COLOR_MAGENTA[2] * factor)
            pygame.draw.line(liq_surf, (r, g, b, 235), (0, ly), (tube_w - 8, ly))
        
        w_offset = math.sin(time_sec * 5.5) * 3
        surface.blit(liq_surf, liq_rect.topleft)
        pygame.draw.ellipse(surface, COLOR_CYAN, (tube_x + 4, tube_y + tube_h - liquid_h - 4 + int(w_offset), tube_w - 8, 8))

        for i in range(3):
            bx = tube_x + 10 + i * 6 + int(math.sin(time_sec * 4 + i) * 3)
            by = tube_y + tube_h - 15 - ((int(time_sec * 30 + i * 25) % (liquid_h - 15)))
            pygame.draw.circle(surface, (255, 255, 255, 200), (bx, by), 3)

        pygame.draw.rect(surface, (255, 255, 255, 210), (tube_x, tube_y, tube_w, tube_h), width=3, border_radius=16)
        pygame.draw.ellipse(surface, (255, 255, 255), (tube_x - 3, tube_y - 5, tube_w + 6, 10), width=3)
        pygame.draw.line(surface, (255, 255, 255, 220), (tube_x + 6, tube_y + 10), (tube_x + 6, tube_y + tube_h - 14), 2)

        # Steam Vapor Particles
        tube_top_x = tube_x + tube_w // 2
        tube_top_y = tube_y - 6
        
        if random.random() < 0.75:
            for p in self.vapor_particles:
                if p.life <= 0:
                    p.reset(tube_top_x, tube_top_y)
                    break

        for p in self.vapor_particles:
            p.update()
            p.draw(surface)

    def draw_left_arm_and_tablet(self, surface, x, y, time_sec, arm_y_lag=0.0):
        """Draws left hand holding tablet with delayed secondary inertia."""
        arm_base_x, arm_base_y = x + 54, y + 54
        hand_x = x + 135
        hand_y = y + 20 + arm_y_lag  # Delayed secondary response
        
        pygame.draw.line(surface, COLOR_WHITE, (arm_base_x, arm_base_y), (hand_x, hand_y), 28)
        pygame.draw.circle(surface, COLOR_WHITE, (hand_x, hand_y), 16)
        
        tab_w, tab_h = 105, 145
        tab_surf = pygame.Surface((tab_w + 40, tab_h + 40), pygame.SRCALPHA)
        
        pygame.draw.rect(tab_surf, (160, 0, 255, 100), (15, 15, tab_w, tab_h), border_radius=18)
        pygame.draw.rect(tab_surf, (18, 14, 32), (20, 20, tab_w, tab_h), border_radius=16)
        pygame.draw.rect(tab_surf, COLOR_PURPLE, (20, 20, tab_w, tab_h), width=3, border_radius=16)
        
        scr_rect = pygame.Rect(28, 28, tab_w - 16, tab_h - 16)
        pygame.draw.rect(tab_surf, (6, 4, 18), scr_rect, border_radius=12)
        
        draw_atom_symbol(tab_surf, (20 + tab_w // 2, 20 + tab_h // 2), 24, COLOR_MAGENTA, orbit_angle=-time_sec * 2.2)
        
        pygame.draw.polygon(tab_surf, (255, 255, 255, 35), [
            (28, 28), (28 + tab_w - 16, 28), (28, 28 + tab_h - 16)
        ])
        
        # Dynamic secondary tilt angle
        omega = 2.0 * math.pi / LOOP_DURATION
        angle_tilt = -16.0 + math.sin(omega * time_sec - 0.45) * 5.0
        rot_tab = pygame.transform.rotate(tab_surf, angle_tilt)
        rot_rect = rot_tab.get_rect(center=(hand_x + 20, hand_y + 15))
        surface.blit(rot_tab, rot_rect)
        
        pygame.draw.circle(surface, COLOR_WHITE, (hand_x + 6, hand_y + 18), 10)
        pygame.draw.circle(surface, COLOR_WHITE, (hand_x + 18, hand_y + 28), 9)

    def render(self, surface, time_sec):
        """Renders character with smooth 5s floating idle animation & secondary momentum dynamics."""
        
        # Fundamental Loop Parameters (5.0s seamless loop)
        omega = 2.0 * math.pi / LOOP_DURATION
        
        # 1. Primary Motion: Weightless Vertical Float & Ease-In-Out
        float_y = math.sin(omega * time_sec) * 22.0
        
        # 2. Secondary Motion A: Horizontal Side-to-Side Body Sway
        sway_x = math.sin(omega * time_sec * 0.5) * 10.0
        
        # 3. Secondary Motion B: Body Rotation / Tilt Angle (Rotates +-3.5 degrees)
        body_tilt_deg = math.sin(omega * time_sec) * 3.5
        
        # 4. Secondary Motion C: Legs & Feet Momentum Swing (Lagging behind body float)
        leg_l_shift = (
            math.sin(omega * time_sec * 0.5 - 0.2) * 5.0,
            math.sin(omega * time_sec - 0.45) * 7.0
        )
        leg_r_shift = (
            math.sin(omega * time_sec * 0.5 - 0.4) * 5.0,
            math.sin(omega * time_sec - 0.60) * 7.0
        )

        # 5. Secondary Motion D: Arm & Object Reaction Lag
        arm_r_lag = math.sin(omega * time_sec - 0.38) * 8.0
        arm_l_lag = math.sin(omega * time_sec - 0.30) * 7.0

        curr_x = self.cx + sway_x
        curr_y = self.cy + float_y
        
        # Automatic periodic eye blinking
        blink_cycle = (time_sec * 0.32) % 1.0
        if blink_cycle > 0.92:
            blink_factor = math.sin((1.0 - blink_cycle) / 0.08 * math.pi)
        else:
            blink_factor = 1.0

        # Background radial light pulse
        bg_glow = pygame.Surface((560, 560), pygame.SRCALPHA)
        for r_curr in range(270, 40, -10):
            a = int(75 * ((1.0 - (r_curr - 40) / 230) ** 2))
            pygame.draw.circle(bg_glow, (140, 30, 255, a), (280, 280), r_curr)
        surface.blit(bg_glow, (curr_x - 280, curr_y - 250))
        
        # Render background star dust
        for star in self.stars:
            star.update()
            star.draw(surface, time_sec)

        # Render Character on a temporary surface for rotational tilt
        char_surf = pygame.Surface((600, 650), pygame.SRCALPHA)
        char_cx, char_cy = 300, 300

        self.draw_head(char_surf, char_cx, char_cy, blink_factor, time_sec, hair_tilt=body_tilt_deg * 0.5)
        self.draw_body_and_coat(char_surf, char_cx, char_cy, time_sec, leg_l_shift, leg_r_shift)
        self.draw_left_arm_and_tablet(char_surf, char_cx, char_cy, time_sec, arm_y_lag=arm_l_lag)
        self.draw_right_arm_and_test_tube(char_surf, char_cx, char_cy, time_sec, arm_y_lag=arm_r_lag)

        # Apply smooth 3D body rotation/tilt
        if abs(body_tilt_deg) > 0.05:
            rot_char = pygame.transform.rotate(char_surf, body_tilt_deg)
            rot_rect = rot_char.get_rect(center=(int(curr_x), int(curr_y)))
            surface.blit(rot_char, rot_rect)
        else:
            surface.blit(char_surf, (int(curr_x - char_cx), int(curr_y - char_cy)))

# --- GIF Exporter Utility ---

def export_looping_gif(character, duration_sec=5.0, fps=30, output_path="chibi_robot.gif"):
    """Generates and saves a 100% seamless 5-second looping animated GIF."""
    print(f"[GIF Exporter] Rendering {int(duration_sec * fps)} frames for 5-second seamless loop...")
    frames = []
    total_frames = int(duration_sec * fps)
    
    temp_surf = pygame.Surface((WIDTH, HEIGHT))
    
    for frame_idx in range(total_frames):
        t = (frame_idx / total_frames) * LOOP_DURATION
        
        temp_surf.fill(COLOR_BG_DARK)
        grad_surf = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
        for y in range(0, HEIGHT, 4):
            factor = y / HEIGHT
            r = int(COLOR_BG_DARK[0] * (1 - factor) + COLOR_BG_GRADIENT[0] * factor)
            g = int(COLOR_BG_DARK[1] * (1 - factor) + COLOR_BG_GRADIENT[1] * factor)
            b = int(COLOR_BG_DARK[2] * (1 - factor) + COLOR_BG_GRADIENT[2] * factor)
            pygame.draw.rect(grad_surf, (r, g, b, 120), (0, y, WIDTH, 4))
        temp_surf.blit(grad_surf, (0, 0))
        
        character.render(temp_surf, t)
        
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
    print(f"[GIF Exporter] Successfully saved 5s seamless animation loop to '{output_path}'!")

# --- Main Window Loop ---

def main():
    character = ChibiRobotScientist(WIDTH // 2, HEIGHT // 2 + 15)
    running = True
    paused = False
    paused_time = 0
    font = pygame.font.SysFont("Consolas", 15)
    
    print("=" * 65)
    print(" CHIBI ROBOT SCIENTIST - 5s FLOATING IDLE ANIMATION")
    print("=" * 65)
    print(" Controls:")
    print("   [SPACE] : Pause / Resume Animation")
    print("   [S]     : Save Screenshot PNG")
    print("   [G]     : Export 5s Seamless Animated GIF ('chibi_robot.gif')")
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
                    paused = not paused
                elif event.key == pygame.K_s:
                    filename = "chibi_robot_screenshot.png"
                    pygame.image.save(screen, filename)
                    print(f"[Screenshot] Saved to '{filename}'")
                elif event.key == pygame.K_g:
                    export_looping_gif(character)

        if not paused:
            current_ticks = pygame.time.get_ticks() - paused_time
            time_sec = current_ticks / 1000.0
        
        screen.fill(COLOR_BG_DARK)
        grad_surf = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
        for y in range(0, HEIGHT, 4):
            factor = y / HEIGHT
            r = int(COLOR_BG_DARK[0] * (1 - factor) + COLOR_BG_GRADIENT[0] * factor)
            g = int(COLOR_BG_DARK[1] * (1 - factor) + COLOR_BG_GRADIENT[1] * factor)
            b = int(COLOR_BG_DARK[2] * (1 - factor) + COLOR_BG_GRADIENT[2] * factor)
            pygame.draw.rect(grad_surf, (r, g, b, 120), (0, y, WIDTH, 4))
        screen.blit(grad_surf, (0, 0))

        character.render(screen, time_sec)

        fps_text = font.render(f"FPS: {int(clock.get_fps())} | Controls: [SPACE] Pause | [S] Save PNG | [G] Export 5s GIF", True, (180, 180, 220))
        screen.blit(fps_text, (20, HEIGHT - 30))

        pygame.display.flip()
        clock.tick(FPS)

    pygame.quit()

if __name__ == "__main__":
    main()
