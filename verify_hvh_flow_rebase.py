import time
from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Set viewport to something standard
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:3000")

        # Wait for board to load
        page.wait_for_selector("[data-testid='cell-8']", timeout=10000)
        print("Board loaded.")

        # Select Human vs Human mode
        print("Selecting Human vs Human mode...")
        # We need to find the select that has HvH option.
        # Based on my conflict resolution, the select has values "HvC" and "HvH".
        # I'll select by value "HvH".
        page.select_option("select:has(option[value='HvH'])", "HvH")
        print("Mode selected: HvH")

        # Verify initial state: Player 1 turn
        # We look for "PLAYER 1" text.
        expect(page.get_by_text("PLAYER 1", exact=True)).to_be_visible()
        print("Verified Player 1 turn.")

        # Player 1 places piece at center (index 8)
        print("Player 1 placing piece at center (index 8)...")
        page.click("[data-testid='cell-8']")

        # Wait a bit for state update
        time.sleep(0.5)

        # Verify turn is now Player 2
        # "PLAYER 2" should be highlighted or visible.
        # My code uses: {state.gameMode === 'HvH' ? 'PLAYER 2' : 'CPU'}
        expect(page.get_by_text("PLAYER 2", exact=True)).to_be_visible()
        print("Verified Player 2 turn.")

        # Player 2 places piece at top (index 0)
        print("Player 2 placing piece at index 0...")
        page.click("[data-testid='cell-0']")

        # Wait a bit
        time.sleep(0.5)

        # Verify turn is back to Player 1
        expect(page.get_by_text("PLAYER 1", exact=True)).to_be_visible()
        print("Verified turn back to Player 1.")

        # Take screenshot
        print("Taking screenshot...")
        page.screenshot(path="verification_hvh_rebase.png")
        print("Screenshot saved to verification_hvh_rebase.png")

        browser.close()

if __name__ == "__main__":
    run()
