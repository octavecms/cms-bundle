<?php

namespace VideInfra\CMSBundle\Form\DataTransformer;
use Symfony\Component\Form\DataTransformerInterface;
use VideInfra\CMSBundle\Model\MediaImage;
use VideInfra\CMSBundle\Model\MediaImageTranslation;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class MediaImageDataTransformer implements DataTransformerInterface
{
    /** @var array */
    private $locales = [];

    /**
     * MediaGalleryItemDataTransformer constructor.
     * @param $locales
     */
    public function __construct($locales)
    {
        $this->locales = $locales;
    }

    /**
     * @param mixed $value
     * @return MediaImage
     */
    public function transform($value)
    {
        if (is_string($value)) {
            $value = json_decode($value, true);
        }

        $item = new MediaImage();
        $item->setImage($value['image'] ?? null);

        foreach ($this->locales as $locale) {
            $translation = new MediaImageTranslation();
            $translation->setLocale($locale);
            $translation->setTranslatable($item);

            if (isset($value['title'][$locale])) {
                $translation->setTitle($value['title'][$locale]);
            }

            $item->addTranslation($translation);
        }

        return $item;
    }

    /**
     * @param mixed $value
     * @return array
     */
    public function reverseTransform($value)
    {
        $data = [];

        if ($value instanceof MediaImage) {

            $titles = [];

            /** @var MediaImageTranslation $translation */
            foreach ($value->getTranslations() as $translation) {
                $titles[$translation->getLocale()] = $translation->getTitle();
            }

            $data = [
                'image' => $value->getImage(),
                'title' => $titles
            ];
        }

        return json_encode($data);
    }
}