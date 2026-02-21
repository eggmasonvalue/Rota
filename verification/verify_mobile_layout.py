from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Emulate Mobile Viewport
    page.set_viewport_size({"width": 375, "height": 800})

    try:
        page.goto("http://localhost:3000")
        page.wait_for_load_state("networkidle")

        # Selectors
        title = page.locator("h1", has_text="ROTA")
        turn_indicator = page.locator("div.flex.gap-3.sm\\:gap-6") # Using the new classes to be specific
        # Or locate by text content for robustness
        turn_indicator = page.get_by_text("PLAYER", exact=True).locator("..") # Parent of 'PLAYER' text

        controls = page.locator("div.flex.flex-wrap.items-end.justify-center")

        if title.count() == 0 or turn_indicator.count() == 0 or controls.count() == 0:
            print("FAIL: Could not find one or more elements.")
            return

        title_box = title.bounding_box()
        turn_box = turn_indicator.bounding_box()
        controls_box = controls.bounding_box()

        print(f"Title Y: {title_box['y']}")
        print(f"Turn Y: {turn_box['y']}")
        print(f"Controls Y: {controls_box['y']}")

        # Verification Logic
        # Title and Turn should be roughly on the same row (similar Y)
        # Allowed variance because of font sizes/alignment
        if abs(title_box['y'] - turn_box['y']) < 20:
             print("PASS: Title and Turn Indicator are on the same row.")
        else:
             print(f"FAIL: Title and Turn Indicator are NOT on the same row. Diff: {abs(title_box['y'] - turn_box['y'])}")

        # Controls should be BELOW Title/Turn
        if controls_box['y'] > title_box['y'] + title_box['height']:
             print("PASS: Controls are below the Title.")
        else:
             print("FAIL: Controls are NOT clearly below the Title.")

        # Take a screenshot
        page.screenshot(path="verification/mobile_layout.png", full_page=True)
        print("Screenshot saved to verification/mobile_layout.png")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
