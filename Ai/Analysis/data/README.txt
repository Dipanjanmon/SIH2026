DROP your labeled images / CSV label files HERE.

Structure suggestion for fine-tuning later:
    data\
      cattle\
         normal\
         fmd\
         lsd\
      poultry\
         normal\
         avian_flu\
      ...

Reference-labeled images are used for the custom-condition training step.
SpeciesNet species detection does NOT need this folder.