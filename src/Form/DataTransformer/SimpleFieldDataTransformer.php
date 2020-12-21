<?php

namespace Octave\CMSBundle\Form\DataTransformer;

use Octave\CMSBundle\Entity\Block;
use Octave\CMSBundle\Entity\BlockEntityInterface;
use Octave\CMSBundle\Entity\BlockTranslateEntityInterface;
use Octave\CMSBundle\Entity\BlockTranslation;
use Symfony\Component\Form\DataTransformerInterface;

class SimpleFieldDataTransformer implements DataTransformerInterface
{
    /**
     * @param mixed $value
     * @return array|mixed
     */
    public function transform($value)
    {
        if (!$value) return $value;
        $items = [];

        foreach ($value as $index => $item) {

            if ($item instanceof Block) {
                $items[$index] = $item;
                continue;
            }

            $block = $this->transformItem($item);

            $items[$index] = $block;
        }

        return $items;
    }

    /**
     * @param $item
     * @return Block
     */
    public function transformItem($item)
    {
        $block = new Block();
        $block->setType($item['type']);
        $block->setOrder($item['order']);
        $block->setContent($item['content']);

        if (isset($item['translations']) && $item['translations']) {

            foreach ($item['translations'] as $locale => $translationItem) {

                $translation = new BlockTranslation();
                $translation->setLocale($locale);
                $translation->setTranslatable($block);
                $translation->setTitle($translationItem['title']);
                $translation->setContent($translationItem['content']);

                $block->addTranslation($translation);
            }
        }

        return $block;
    }

    /**
     * @param mixed $value
     * @return array|mixed
     */
    public function reverseTransform($value)
    {
        if (!$value) return $value;
        $arrayData = [];

        uasort($value, [$this, 'sort']);

        /** @var BlockEntityInterface $item */
        foreach ($value as $index => $item) {
            $arrayData[$item->getOrder()]['type'] = $item->getType();
            $arrayData[$item->getOrder()]['order'] = $item->getOrder();
            $arrayData[$item->getOrder()]['content'] = $item->getContent();

            if (method_exists($item, 'getTranslations')) {

                $translations = [];
                /** @var BlockTranslateEntityInterface $translation */
                foreach ($item->getTranslations() as $translation) {

                    $translations[$translation->getLocale()] = [
                        'title' => $translation->getTitle(),
                        'content' => $translation->getContent()
                    ];
                }

                $arrayData[$item->getOrder()]['translations'] = $translations;
            }
        }

        return $arrayData;
    }

    /**
     * @param $a
     * @param $b
     * @return int
     */
    private function sort($a, $b)
    {
        if ($a instanceof Block) {
            return $a->getOrder() > $b->getOrder() ? 1 : -1;
        }

        return $a['order'] > $b['order'] ? 1 : -1;
    }
}