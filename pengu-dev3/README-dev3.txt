Drop-in: copy app/pet/* into repo /app/pet, append changes/dev3-pet.md, paste STATE-dev3-block.md into STATE.md.
Test: open app/pet/index.html in Chrome. Console:
  Pet.wanderNow()  Pet.jumpNow()  Pet.play('nope')
  mockState('thinking')  mockState('idle')  mockIdle(400)  mockIdle(0)
  mockSay('Is a stack really right for a queue?')  mockVoice(true) then hover the pet
  Hover pet -> chat box -> type -> Enter. Drag the pet (logs [mock send]), click it (pet:clicked).
