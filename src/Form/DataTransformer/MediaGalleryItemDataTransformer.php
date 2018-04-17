<?php

namespace Octave\CMSBundle\Form\DataTransformer;

use Symfony\Component\Form\DataTransformerInterface;
use Octave\CMSBundle\Model\MediaGalleryItem;
use Octave\CMSBundle\Model\MediaGalleryItemTranslation;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class MediaGalleryItemDataTransformer implements DataTransformerInterface
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
     * @return MediaGalleryItem
     */
    public function transform($value)
    {
        $item = new MediaGalleryItem();
        $item->setImage($value['image'] ?? null);
        $item->setGalleryorder($value['galleryorder'] ?? null);

        foreach ($this->locales as $locale) {
            $translation = new MediaGalleryItemTranslation();
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

        if ($value instanceof MediaGalleryItem) {

            $titles = [];

            /** @var MediaGalleryItemTranslation $translation */
            foreach ($value->getTranslations() as $translation) {
                $titles[$translation->getLocale()] = $translation->getTitle();
            }

            $data = [
                'image' => $value->getImage(),
                'galleryorder' => $value->getGalleryorder(),
                'title' => $titles
            ];
        }

        return $data;
    }
}